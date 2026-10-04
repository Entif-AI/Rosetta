"""Bounded real extraction and direct state evidence from the unmodified donor."""
import argparse
import asyncio
import importlib.metadata
import json
import logging
import os
import platform
import socket
from pathlib import Path

from graphiti_falkor_runner import GRAPH_NAME, open_fixture_driver, run
from graphiti_provider import provider_settings, provider_client, probe_provider, graphiti_clients, public_config, now
from graphiti_support import base, extract_selected, EXTRACTION_LOSS

QUERIES = {
    'episodes': 'MATCH (e:Episodic) RETURN e.uuid AS uuid, e.name AS name, e.content AS content, e.created_at AS created_at, e.valid_at AS valid_at, e.group_id AS group_id ORDER BY uuid',
    'entities': 'MATCH (e:Entity) RETURN e.uuid AS uuid, e.name AS name, e.summary AS summary, e.created_at AS created_at, e.group_id AS group_id ORDER BY uuid',
    'facts': 'MATCH (a:Entity)-[r:RELATES_TO]->(b:Entity) RETURN r.uuid AS uuid, a.uuid AS source_uuid, a.name AS source_name, b.uuid AS target_uuid, b.name AS target_name, r.name AS relation, r.fact AS fact, r.episodes AS support_episode_refs, r.created_at AS created_at, r.valid_at AS valid_at, r.invalid_at AS invalid_at, r.expired_at AS expired_at ORDER BY uuid',
}


async def snapshot(driver):
    return {name: (await driver.execute_query(query))[0] for name, query in QUERIES.items()}


async def prove(selected, output, label):
    logging.disable(logging.CRITICAL)
    from graphiti_core import Graphiti
    settings = provider_settings()
    receipts, phase = [], {'name': label + ':capability-probe'}
    client = provider_client(settings, receipts, phase)
    driver = graphiti = None
    started = now()
    transitions, duplicates = [], []
    try:
        probe = await asyncio.wait_for(probe_provider(settings, client), 120)
        driver, backend, names = await open_fixture_driver()
        graphiti = Graphiti(graph_driver=driver, **graphiti_clients(settings, client, probe['embeddingDimension']))

        async def observe(event, episode, result):
            if event == 'before':
                phase['name'] = label + ':episode:' + str(len(transitions))
                return
            state = await snapshot(driver)
            if event == 'duplicate':
                duplicates.append(dict(episodeId=episode['id'], physicalStateUnchanged=state == transitions[-1]['state']))
                return
            transitions.append(dict(episodeId=episode['id'], donorEpisodeId=result.episode.uuid,
                                    sourceSequence=episode['sourceSequence'], effectiveAt=episode['effectiveAt'],
                                    materializedAt=now(), state=state))
            # A crash leaves bounded, inspectable progress instead of an ambiguous invisible graph.
            Path(str(output) + '.progress.json').write_text(json.dumps(dict(startedAt=started, transitions=transitions,
                                                                         responseProvenance=receipts), indent=2) + '\n')
            print(json.dumps(dict(run=label, processed=len(transitions), facts=len(state['facts']), entities=len(state['entities']))), flush=True)

        # Duplicate transport is deliberately delivered to the real wrapper after one successful inference.
        transport = dict(selected, episodes=[selected['episodes'][0], selected['episodes'][0], *selected['episodes'][1:]])
        artifacts = await extract_selected(graphiti, transport, GRAPH_NAME, observe)
        projection = base(selected)
        config = public_config(settings, probe['embeddingDimension'])
        projection['derivation'].update(mode='model-backed', provider=settings['provider'], model=settings['model'],
                                        embedder=settings['embedder'], reranker=settings['reranker'],
                                        databaseVersion=backend['version'], extractionConfig=config)
        projection.update(artifacts=artifacts, loss=list(EXTRACTION_LOSS))
        direct = {}
        for name, effective in [('historical', '2000-01-02T12:00:00+00:00'), ('current', '2000-01-06T00:00:00+00:00')]:
            query = QUERIES['facts'].replace(' RETURN ', " WHERE r.valid_at <= '" + effective + "' AND (r.invalid_at IS NULL OR r.invalid_at > '" + effective + "') RETURN ")
            direct[name] = dict(effectiveAt=effective, query=query, rows=(await driver.execute_query(query))[0])
        final = await snapshot(driver)
        assert len(final['episodes']) == len(selected['episodes'])
        assert final['entities'] and final['facts']
        assert duplicates and all(d['physicalStateUnchanged'] for d in duplicates)
        admitted = {t['donorEpisodeId'] for t in transitions}
        assert all(set(f['support_episode_refs'] or []) <= admitted for t in transitions for f in t['state']['facts'])
        # Genuine later changes are observed from graph state, not manufactured by the wrapper.
        first = {f['uuid']: f for f in transitions[0]['state']['facts']}
        second = {f['uuid']: f for f in transitions[1]['state']['facts']}
        changes = [dict(uuid=uuid, before=first.get(uuid), after=f) for uuid, f in second.items() if first.get(uuid) != f]
        assert changes
        before_retraction = {f['uuid'] for f in transitions[2]['state']['facts']}
        after_retraction = {f['uuid'] for f in transitions[3]['state']['facts']}
        assert before_retraction <= after_retraction
        late = transitions[2]
        late_episode = next(e for e in late['state']['episodes'] if e['uuid'] == late['donorEpisodeId'])
        assert late['effectiveAt'] < transitions[1]['effectiveAt']
        assert late_episode['valid_at'].startswith('2000-01-02')
        # Exercise a real refused loopback provider before graph construction; keep the successful graph intact.
        phase['name'] = label + ':provider-outage'
        with socket.socket() as reserved:
            reserved.bind(('127.0.0.1', 0))
            unavailable_port = reserved.getsockname()[1]
        prior_url = os.environ['TRACE_GRAPHITI_BASE_URL']
        try:
            os.environ['TRACE_GRAPHITI_BASE_URL'] = 'http://127.0.0.1:' + str(unavailable_port) + '/v1'
            outage = await asyncio.wait_for(run(selected, argparse.Namespace(live=True)), 15)
        finally:
            os.environ['TRACE_GRAPHITI_BASE_URL'] = prior_url
        assert outage['derivation']['mode'] == 'unavailable' and not outage['artifacts']
        assert await snapshot(driver) == final
        result = dict(status='passed', startedAt=started, completedAt=now(), selected=selected,
                      projection=projection, backend=backend, graphsBefore=names, capabilityProbe=probe,
                      responseProvenance=receipts, directQueryDefinitions=QUERIES, transitions=transitions,
                      directQueries=direct, physicalState=final, temporalChanges=changes,
                      duplicateDelivery=duplicates, outOfOrder=dict(effectiveAt=late['effectiveAt'],
                      materializedAt=late['materializedAt'], persistedEffectiveAt=late_episode['valid_at'],
                      disposition='Effective time remains older despite later materialization; donor facts remain attributed interpretations.'),
                      retraction=dict(historyRetained=True, before=transitions[2]['state']['facts'], after=transitions[3]['state']['facts']),
                      contradictionAndIdentity=dict(sourceEpisodeId=transitions[4]['episodeId'],
                      donorState=transitions[4]['state'], identityAuthority='unresolved; donor UUID does not establish canonical person identity'),
                      outage=outage, outagePreservesPhysicalGraph=True,
                      invariants=dict(selectedEpisodesPersisted=True, actualEntitiesAndFacts=True, sourceSupportResolves=True,
                      actualLaterSemanticChange=True, earlierHistoryRetained=True, effectiveAndMaterializedOrdersDistinct=True,
                      duplicateTransportHasNoNewSupport=True, outagePreservesSemanticState=True),
                      runtime=dict(python=platform.python_version(), resolvedPackages={name: importlib.metadata.version(name)
                      for name in ['graphiti-core', 'falkordb', 'openai', 'httpx', 'httpx2', 'pydantic']}))
        output.write_text(json.dumps(result, indent=2) + '\n')
        return result
    finally:
        if graphiti is not None:
            await graphiti.close()
        elif driver is not None:
            await driver.close()
        await client.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('input')
    parser.add_argument('output')
    parser.add_argument('--label', default='initial')
    args = parser.parse_args()
    try:
        asyncio.run(prove(json.loads(Path(args.input).read_text()), Path(args.output), args.label))
    except Exception as exc:
        # Provider exceptions can contain credentials; never print their bodies.
        print(json.dumps(dict(status='failed', failureClass=type(exc).__name__, partialGraphMayRemain=True)), flush=True)
        raise SystemExit(1) from None


if __name__ == '__main__':
    main()
