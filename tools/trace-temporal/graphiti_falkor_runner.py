"""Active experimental Graphiti path; the pinned first-party driver owns RESP I/O."""
import argparse
import asyncio
import importlib.metadata
import json
import logging
import os
import subprocess
from pathlib import Path

from graphiti_support import PIN, COMMIT, base, extract_selected, EXTRACTION_LOSS

os.environ['GRAPHITI_TELEMETRY_ENABLED'] = 'false'
GRAPH_NAME = 'entif_graphiti_1737'
IMAGE = 'falkordb/falkordb:v4.20.7@sha256:13996aa523f0dd283f6bd6df6620b094dcea525452417c4d6ef9bef15dc9998d'


def fixture_config():
    if os.environ.get('TRACE_GRAPH_ISOLATED') != 'true':
        raise ValueError('Explicit isolated fixture ownership is required.')
    port = int(os.environ.get('TRACE_GRAPHITI_FALKORDB_PORT', '16380'))
    if not 1 <= port <= 65535:
        raise ValueError('Invalid fixture port.')
    # Operational adapter graph selection must never redirect this jurisdiction.
    return dict(host='127.0.0.1', port=port, graphName=GRAPH_NAME)


def inspect_fixture_runtime():
    config = fixture_config()
    container = os.environ.get('TRACE_GRAPHITI_FALKORDB_CONTAINER', 'entif-graphiti-falkor-1737')
    info = json.loads(subprocess.check_output(['docker', 'inspect', container], timeout=10))[0]
    if info['Config']['Image'] != IMAGE or info['Config']['Labels'].get('entif.issue') != '1737':
        raise ValueError('Unowned or unpinned fixture runtime.')
    bindings = info['NetworkSettings']['Ports']['6379/tcp']
    if not any(b['HostIp'] == config['host'] and int(b['HostPort']) == config['port'] for b in bindings):
        raise ValueError('Fixture endpoint does not match the owned loopback binding.')
    modules = json.loads(subprocess.check_output(['docker', 'exec', container, 'redis-cli', '--json', 'MODULE', 'LIST'], timeout=10))
    if not any(m['name'] == 'graph' and m['ver'] == 42007 for m in modules):
        raise ValueError('Unexpected Falkor module version.')
    if importlib.metadata.version('graphiti-core') != PIN:
        raise ValueError('Incorrect graphiti-core version.')
    return config, container, info


async def open_fixture_driver():
    config, container, info = inspect_fixture_runtime()
    # The donor can log provider errors with input values. Emit sanitized evidence only.
    logging.disable(logging.CRITICAL)
    from falkordb.asyncio import FalkorDB
    from graphiti_core.driver.falkordb_driver import FalkorDriver
    client = FalkorDB(host=config['host'], port=config['port'], socket_connect_timeout=3, socket_timeout=20)
    driver = None
    try:
        names = sorted(await asyncio.wait_for(client.list_graphs(), 5))
        if GRAPH_NAME in names:
            raise ValueError('Semantic fixture graph already exists; reconcile before retry.')
        driver = FalkorDriver(falkor_db=client, database=GRAPH_NAME)
        await asyncio.wait_for(driver.build_indices_and_constraints(), 30)
        deadline = asyncio.get_running_loop().time() + 10
        required = {
            ('Entity', 'NODE'): {'uuid', 'group_id', 'name', 'created_at'},
            ('Episodic', 'NODE'): {'uuid', 'group_id', 'created_at', 'valid_at'},
            ('Community', 'NODE'): {'uuid'},
            ('Saga', 'NODE'): {'uuid', 'group_id', 'name'},
            ('RELATES_TO', 'RELATIONSHIP'): {'uuid', 'group_id', 'name', 'created_at', 'expired_at', 'valid_at', 'invalid_at'},
            ('MENTIONS', 'RELATIONSHIP'): {'uuid', 'group_id'},
            ('HAS_MEMBER', 'RELATIONSHIP'): {'uuid'},
            ('HAS_EPISODE', 'RELATIONSHIP'): {'uuid', 'group_id'},
            ('NEXT_EPISODE', 'RELATIONSHIP'): {'uuid', 'group_id'},
        }
        fulltext = {('Entity', 'NODE'), ('Episodic', 'NODE'), ('Community', 'NODE'), ('RELATES_TO', 'RELATIONSHIP')}
        while True:
            indexes, _, _ = await driver.execute_query('CALL db.indexes()')
            constraints, _, _ = await driver.execute_query('CALL db.constraints()')
            if any(row.get('status') == 'FAILED' for row in indexes + constraints):
                raise ValueError('Falkor schema failed.')
            ranges = {(r['label'], r['entitytype']): {p for p, kinds in r['types'].items() if 'RANGE' in kinds}
                      for r in indexes if r['status'] == 'OPERATIONAL'}
            texts = {(r['label'], r['entitytype']) for r in indexes if r['status'] == 'OPERATIONAL'
                     and any('FULLTEXT' in kinds for kinds in r['types'].values())}
            if all(fields <= ranges.get(key, set()) for key, fields in required.items()) and fulltext <= texts and all(c['status'] == 'OPERATIONAL' for c in constraints):
                break
            if asyncio.get_running_loop().time() >= deadline:
                raise TimeoutError('Falkor schema readiness timed out.')
            await asyncio.sleep(0.05)
        backend = dict(provider='FalkorDB', version='4.20.7', moduleVersion=42007,
                       image=IMAGE, imageId=info['Image'], container=container, **config,
                       driver='graphiti_core.driver.falkordb_driver.FalkorDriver',
                       graphitiVersion=PIN, graphitiCommit=COMMIT,
                       clientVersion=importlib.metadata.version('falkordb'), protocol='RESP',
                       indexes=indexes, constraints=constraints,
                       constraintPolicy='Pinned first-party donor creates indexes, no unique constraints.',
                       posture='local-private-fixture',
                       promotionBoundary='SSPLv1 public/network service deployment requires separate review')
        return driver, backend, names
    except Exception:
        if driver is not None:
            await driver.close()
        else:
            await client.aclose()
        raise


async def run(selected, args):
    output = base(selected)
    if not args.live:
        output['loss'] = ['Model-off requested. No donor extraction or graph mutation occurred.']
        return output
    required = ['OPENAI_API_KEY', 'TRACE_GRAPHITI_MODEL', 'TRACE_GRAPHITI_EMBEDDER', 'TRACE_GRAPHITI_RERANKER']
    missing = [name for name in required if not os.environ.get(name)]
    if missing:
        output['loss'] = ['Live inference unavailable: missing ' + ', '.join(missing) + '. Deterministic evidence retained.']
        return output
    if any(episode.get('effectiveAt') is None for episode in selected['episodes']):
        output['loss'] = ['Live donor requires an explicitly supplied effective time; no arrival-time fallback.']
        return output
    driver = graphiti = None
    try:
        driver, backend, _ = await open_fixture_driver()
        from graphiti_core import Graphiti
        from graphiti_core.llm_client.config import LLMConfig
        from graphiti_core.llm_client.openai_client import OpenAIClient
        from graphiti_core.embedder.openai import OpenAIEmbedder, OpenAIEmbedderConfig
        from graphiti_core.cross_encoder.openai_reranker_client import OpenAIRerankerClient
        model = os.environ['TRACE_GRAPHITI_MODEL']
        embedder = os.environ['TRACE_GRAPHITI_EMBEDDER']
        reranker = os.environ['TRACE_GRAPHITI_RERANKER']
        graphiti = Graphiti(graph_driver=driver,
                            llm_client=OpenAIClient(config=LLMConfig(model=model, small_model=model, temperature=0)),
                            embedder=OpenAIEmbedder(config=OpenAIEmbedderConfig(embedding_model=embedder)),
                            cross_encoder=OpenAIRerankerClient(config=LLMConfig(model=reranker)))
        # Falkor group_id selects a physical graph. Keep it identical to driver.database.
        output['artifacts'] = await extract_selected(graphiti, selected, GRAPH_NAME)
        output['derivation'].update(mode='model-backed', provider='openai', model=model,
                                    databaseVersion=backend['version'], embedder=embedder, reranker=reranker,
                                    extractionConfig=dict(temperature=0, smallModel=model, groupId=GRAPH_NAME,
                                                          updateCommunities=False, backend=backend,
                                                          supportPolicy='conservative-cumulative-selected-context'))
        output['loss'] = list(EXTRACTION_LOSS)
        return output
    except Exception as exc:
        output = base(selected)
        output['loss'] = ['Optional Graphiti/Falkor path failed: ' + type(exc).__name__ + '. Partial derived state may remain. No semantic artifacts admitted; canonical/deterministic paths unchanged.']
        return output
    finally:
        if graphiti is not None:
            await graphiti.close()
        elif driver is not None:
            await driver.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('input')
    parser.add_argument('output')
    parser.add_argument('--live', action='store_true')
    args = parser.parse_args()
    selected = json.loads(Path(args.input).read_text())
    result = asyncio.run(run(selected, args))
    Path(args.output).write_text(json.dumps(result, indent=2) + '\n')


if __name__ == '__main__':
    main()
