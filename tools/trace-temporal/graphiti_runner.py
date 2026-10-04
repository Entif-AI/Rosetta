"""Optional pinned donor runtime. Invoke through run.mjs for Rosetta admission."""
import argparse
import asyncio
import hashlib
import importlib.metadata
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

os.environ['GRAPHITI_TELEMETRY_ENABLED'] = 'false'
PIN = '0.30.2'
COMMIT = 'eaa4128681bc53487138a4bbc22d58336ebe70d2'


def utc(value):
    if value is None:
        return None
    if isinstance(value, str):
        value = datetime.fromisoformat(value.replace('Z', '+00:00'))
    return value.astimezone(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')


def base(selected):
    return {
        'profile': 'trace.graphiti-projection.v1', 'profileVersion': '1.0.0',
        'selected': selected,
        'derivation': {'mode': 'unavailable', 'graphitiVersion': PIN, 'graphitiCommit': COMMIT,
                       'databaseVersion': None, 'provider': None, 'model': None, 'modelVersion': None,
                       'extractionConfig': {}, 'embedder': None, 'reranker': None, 'adapterVersion': '1.0.0'},
        'artifacts': [], 'loss': [],
    }


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
    from graphiti_core.nodes import EpisodeType
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
        known = []
        donor_episodes = {}
        last_revision = {}
        for episode in selected['episodes']:
            if episode['id'] in known:
                continue
            if episode['effectiveAt'] is None:
                raise ValueError('Live donor requires an explicitly supplied effective time; no arrival-time fallback.')
            result = await graphiti.add_episode(
                name=episode['id'], episode_body=json.dumps(episode['content']),
                source_description='Selected Rosetta TRACE-NORM evidence; wrapper=' + episode['id'],
                reference_time=datetime.fromisoformat(episode['effectiveAt'].replace('Z', '+00:00')),
                source=EpisodeType.json, group_id=group, update_communities=False)
            known.append(episode['id'])
            donor_episodes[result.episode.uuid] = episode['id']
            recorded = utc(datetime.now(timezone.utc))
            objects = [('episode', result.episode)] + [('entity', n) for n in result.nodes] + [('edge', e) for e in result.episodic_edges] + [('fact', e) for e in result.edges]
            for kind, item in objects:
                raw = item.model_dump(mode='json')
                if any(ref not in donor_episodes for ref in raw.get('episodes', [])):
                    raise ValueError('Donor output cites an episode outside admitted selected evidence.')
                identity = kind + ':' + item.uuid
                revision = identity + ':' + hashlib.sha256(episode['id'].encode()).hexdigest()[:16]
                prior = last_revision.get(identity)
                output['artifacts'].append({
                    'id': revision, 'kind': kind, 'interpretation': json.dumps(raw, sort_keys=True),
                    'supportEpisodeIds': list(known),
                    'validFrom': utc(raw.get('valid_at')) if kind == 'fact' else episode['effectiveAt'],
                    'validUntil': utc(raw.get('invalid_at')) if kind == 'fact' else None,
                    'validUntilKnownAt': recorded if kind == 'fact' and raw.get('invalid_at') else None,
                    'validUntilSupportEpisodeIds': list(known) if kind == 'fact' and raw.get('invalid_at') else [],
                    'materializedAt': recorded, 'supersedes': [prior] if prior else [], 'identity': 'unresolved',
                })
                last_revision[identity] = revision
        output['loss'] = [
            'Model-backed extraction is nondeterministic; temperature zero is not determinism.',
            'Support conservatively includes all preceding selected context. Any revoked support fences the artifact.',
            'Donor identities remain unresolved interpretations; no equivalence or independent corroboration is asserted.',
            'Unknown donor validity is omitted from visible temporal inspection. Raw invalidation fields remain in attributed interpretation.',
            'Fresh drop/re-extraction can differ in identifiers and inferred facts. Exact replay requires preserved accepted outputs.',
        ]
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
