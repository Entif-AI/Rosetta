"""Real first-party donor persistence proof, explicitly without semantic inference."""
import argparse
import asyncio
import hashlib
import importlib.metadata
import json
import platform
from datetime import datetime, timezone
from pathlib import Path

from graphiti_falkor_runner import GRAPH_NAME, open_fixture_driver
from graphiti_support import utc


async def prove(selected):
    driver, backend, names_before = await open_fixture_driver()
    from graphiti_core.nodes import EpisodicNode, EpisodeType
    created = datetime.now(timezone.utc)
    nodes = [EpisodicNode(uuid=hashlib.sha256(e['id'].encode()).hexdigest(), name=e['id'],
                          group_id=GRAPH_NAME, source=EpisodeType.json,
                          source_description='Selected TRACE-NORM wrapper=' + e['id'],
                          content=json.dumps(e['content'], sort_keys=True),
                          created_at=created,
                          valid_at=datetime.fromisoformat(e['effectiveAt'].replace('Z', '+00:00')))
             for e in selected['episodes']]
    query = 'MATCH (e:Episodic) RETURN e.uuid AS uuid, e.name AS name, e.group_id AS groupId, e.content AS content, e.created_at AS createdAt, e.valid_at AS effectiveAt ORDER BY name'
    expected = sorted([dict(uuid=n.uuid, name=n.name, groupId=GRAPH_NAME, content=n.content,
                            createdAt=n.created_at.isoformat(), effectiveAt=n.valid_at.isoformat())
                       for n in nodes], key=lambda n: n['name'])
    try:
        for node in nodes:
            await node.save(driver)
        rows, _, _ = await driver.execute_query(query)
        assert rows == expected, 'Selected episode persistence mismatch.'
        for node in nodes:
            await node.save(driver)
        duplicate_rows, _, _ = await driver.execute_query(query)
        assert duplicate_rows == rows, 'Duplicate delivery manufactured episode support.'
        chronological, _, _ = await driver.execute_query('MATCH (e:Episodic) RETURN e.name AS name, e.valid_at AS effectiveAt ORDER BY effectiveAt, name')
        assert chronological == sorted([dict(name=n.name, effectiveAt=n.valid_at.isoformat()) for n in nodes], key=lambda n: (n['effectiveAt'], n['name']))
        facts, _, _ = await driver.execute_query('MATCH ()-[r:RELATES_TO]->() RETURN count(r) AS count')
        assert facts == [{'count': 0}], 'Backend-only baseline cannot claim inferred facts.'
        await driver.client.select_graph(GRAPH_NAME).delete()
        assert sorted(await driver.client.list_graphs()) == names_before
        for node in nodes:
            await node.save(driver)
        rebuilt, _, _ = await driver.execute_query(query)
        assert rebuilt == expected, 'First-party episode rebuild mismatch.'
        await driver.client.select_graph(GRAPH_NAME).delete()
        assert sorted(await driver.client.list_graphs()) == names_before
        donor_root = Path(importlib.metadata.distribution('graphiti-core').locate_file('graphiti_core'))
        donor_paths = ['driver/falkordb_driver.py', 'driver/falkordb/operations/episode_node_ops.py', 'graph_queries.py']
        return dict(profile='trace-graphiti-falkordb-backend-proof-v1', observedAt=utc(created),
                    status='backend-only', semanticAcceptance=False, modelCalls=0, inferredFacts=0,
                    selected=selected, backend=backend, episodeRows=rows, chronologicalRows=chronological,
                    duplicateDeliveryIdempotent=True, episodePersistenceRebuilt=True,
                    dropped=True, otherGraphNamesPreserved=True, donorDigests={p: hashlib.sha256((donor_root / p).read_bytes()).hexdigest() for p in donor_paths},
                    runtime=dict(python=platform.python_version(), distributions={d.metadata['Name']: d.version for d in importlib.metadata.distributions()}),
                    loss=['No model extraction, semantic invalidation or semantic current-truth outcome is proven by this persistence baseline.',
                          'Effective event time, source observed/recorded time and donor materialization time remain distinct.',
                          'A late old episode is inspectable by effective time; semantic truth handling requires live donor acceptance.'])
    finally:
        await driver.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('input')
    parser.add_argument('output')
    args = parser.parse_args()
    result = asyncio.run(prove(json.loads(Path(args.input).read_text())))
    Path(args.output).write_text(json.dumps(result, indent=2, sort_keys=True) + '\n')


if __name__ == '__main__':
    main()
