"""Provider-neutral mapping from the pinned donor to Rosetta temporal evidence."""
import hashlib
import json
from datetime import datetime, timezone

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


async def extract_selected(graphiti, selected, group, observer=None):
    from graphiti_core.nodes import EpisodeType
    artifacts = []
    known = []
    donor_episodes = {}
    last_revision = {}
    for episode in selected['episodes']:
        if episode['id'] in known:
            if observer:
                await observer('duplicate', episode, None)
            continue
        if episode['effectiveAt'] is None:
            raise ValueError('Live donor requires an explicitly supplied effective time; no arrival-time fallback.')
        if observer:
            await observer('before', episode, None)
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
            valid_from = utc(raw.get('valid_at')) if kind == 'fact' else episode['effectiveAt']
            valid_until = utc(raw.get('invalid_at')) if kind == 'fact' else None
            if valid_until and (not valid_from or valid_until < valid_from):
                # Keep the raw conflicting interpretation; admit no invented valid interval.
                valid_from = valid_until = None
            artifacts.append({
                'id': revision, 'kind': kind, 'interpretation': json.dumps(raw, sort_keys=True),
                'supportEpisodeIds': list(known),
                'validFrom': valid_from,
                'validUntil': valid_until,
                'validUntilKnownAt': recorded if valid_until else None,
                'validUntilSupportEpisodeIds': list(known) if valid_until else [],
                'materializedAt': recorded, 'supersedes': [prior] if prior else [], 'identity': 'unresolved',
            })
            last_revision[identity] = revision
        if observer:
            await observer('after', episode, result)
    return artifacts


EXTRACTION_LOSS = [
    'Model-backed extraction is nondeterministic; temperature zero is not determinism.',
    'Support conservatively includes all preceding selected context. Any revoked support fences the artifact.',
    'Donor identities remain unresolved interpretations; no equivalence or independent corroboration is asserted.',
    'Unknown donor validity is omitted from visible temporal inspection. Raw invalidation fields remain in attributed interpretation.',
    'Fresh drop/re-extraction can differ in identifiers and inferred facts. Exact replay requires preserved accepted outputs.',
    'Contradictory donor intervals remain in raw attributed interpretation; no interval is admitted for them.',
]
