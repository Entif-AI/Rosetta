"""Optional pinned donor runtime. Invoke through run.mjs for Rosetta admission."""
import argparse
import asyncio
import importlib.metadata
import json
import os
import re
from pathlib import Path
from urllib.parse import urlparse

os.environ['GRAPHITI_TELEMETRY_ENABLED'] = 'false'
from graphiti_support import PIN, COMMIT, base, extract_selected, EXTRACTION_LOSS




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
    if os.environ.get('TRACE_GRAPH_ISOLATED') != 'true':
        raise ValueError('Live fixture requires TRACE_GRAPH_ISOLATED=true and an owned disposable database.')
    uri = os.environ.get('TRACE_NEO4J_URI', 'bolt://127.0.0.1:17687')
    endpoint = urlparse(uri)
    if endpoint.scheme != 'bolt' or endpoint.hostname not in ('127.0.0.1', 'localhost', '::1') or endpoint.username or endpoint.password:
        raise ValueError('Only credential-free loopback bolt fixture endpoints are permitted.')
    if importlib.metadata.version('graphiti-core') != PIN:
        raise ValueError('Incorrect graphiti-core version.')
    from graphiti_core import Graphiti
    from graphiti_core.llm_client.config import LLMConfig
    from graphiti_core.llm_client.openai_client import OpenAIClient
    from graphiti_core.embedder.openai import OpenAIEmbedder, OpenAIEmbedderConfig
    from graphiti_core.cross_encoder.openai_reranker_client import OpenAIRerankerClient
    from graphiti_core.utils.maintenance.graph_data_operations import clear_data

    model = os.environ['TRACE_GRAPHITI_MODEL']
    embedder = os.environ['TRACE_GRAPHITI_EMBEDDER']
    reranker = os.environ['TRACE_GRAPHITI_RERANKER']
    config = LLMConfig(model=model, small_model=model, temperature=0)
    graphiti = Graphiti(uri, 'neo4j', os.environ.get('TRACE_NEO4J_PASSWORD', 'trace-fixture-development'),
                        llm_client=OpenAIClient(config=config),
                        embedder=OpenAIEmbedder(config=OpenAIEmbedderConfig(embedding_model=embedder)),
                        cross_encoder=OpenAIRerankerClient(config=LLMConfig(model=reranker)))
    group = 'rosetta_trace_temp_' + selected['normalizedDigest'][:16]
    assert re.fullmatch(r'[a-zA-Z0-9_-]+', group)
    try:
        rows, _, _ = await graphiti.driver.execute_query('CALL dbms.components() YIELD versions RETURN versions[0] AS version')
        database_version = rows[0]['version']
        output['derivation'].update(mode='model-backed', provider='openai', model=model,
                                    databaseVersion=database_version, embedder=embedder, reranker=reranker,
                                    extractionConfig={'temperature': 0, 'smallModel': model, 'groupId': group,
                                                      'updateCommunities': False, 'supportPolicy': 'conservative-cumulative-selected-context'})
        await graphiti.build_indices_and_constraints()
        # The explicit isolated flag authorizes resetting this fixture group only.
        await clear_data(graphiti.driver, group_ids=[group])
        output['artifacts'] = await extract_selected(graphiti, selected, group)
        output['loss'] = list(EXTRACTION_LOSS)
        return output
    except Exception as exc:
        # Do not leak provider messages, endpoints, or credentials into evidence.
        output = base(selected)
        output['loss'] = ['Optional Graphiti path failed: ' + type(exc).__name__ + '. Partial physical derived state may remain. No visible semantic artifacts admitted; source/normalization unchanged.']
        return output
    finally:
        await graphiti.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('input')
    parser.add_argument('output')
    parser.add_argument('--live', action='store_true')
    args = parser.parse_args()
    selected = json.loads(Path(args.input).read_text())
    try:
        result = asyncio.run(run(selected, args))
    except (ImportError, importlib.metadata.PackageNotFoundError) as exc:
        result = base(selected)
        result['loss'] = ['Optional pinned runtime unavailable: ' + type(exc).__name__ + '. No semantic artifacts admitted.']
    Path(args.output).write_text(json.dumps(result, indent=2) + '\n')


if __name__ == '__main__':
    main()
