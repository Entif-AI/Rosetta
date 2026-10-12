"""Real indexed donor-runtime temporal boundaries, without model inference."""
import asyncio
import os
import unittest


@unittest.skipUnless(os.environ.get('TRACE_GRAPH_ISOLATED') == 'true', 'Requires an explicitly owned Falkor fixture.')
class EffectiveQueryBoundary(unittest.TestCase):
    def test_indexed_history_excludes_future_and_current_excludes_terminated_facts(self):
        async def exercise():
            from graphiti_falkor_runner import GRAPH_NAME, open_fixture_driver
            from prove_falkor_semantic import effective_facts

            driver, _, prior_graphs = await open_fixture_driver()
            try:
                await driver.execute_query("""
                    CREATE (a:Entity {uuid: 'a', name: 'A'}), (b:Entity {uuid: 'b', name: 'B'}),
                    (a)-[:RELATES_TO {uuid: 'historical', valid_at: '2000-01-01T00:00:00+00:00',
                        invalid_at: '2000-01-03T00:00:00+00:00'}]->(b),
                    (a)-[:RELATES_TO {uuid: 'current', valid_at: '2000-01-03T00:00:00+00:00'}]->(b),
                    (a)-[:RELATES_TO {uuid: 'unknown'}]->(b)
                """)
                historical = await effective_facts(driver, '2000-01-02T12:00:00+00:00')
                current = await effective_facts(driver, '2000-01-06T00:00:00+00:00')
                self.assertEqual([row['uuid'] for row in historical['rows']], ['historical'])
                self.assertEqual([row['uuid'] for row in current['rows']], ['current'])
            finally:
                await driver.client.select_graph(GRAPH_NAME).delete()
                self.assertEqual(sorted(await driver.client.list_graphs()), prior_graphs)
                await driver.close()

        asyncio.run(exercise())


if __name__ == '__main__':
    unittest.main()
