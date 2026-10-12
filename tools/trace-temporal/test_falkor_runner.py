import argparse
import asyncio
import os
import unittest
from unittest.mock import AsyncMock, patch

import graphiti_falkor_runner as runner


class FalkorRuntimeBoundary(unittest.TestCase):
    def test_model_off_never_opens_graph_or_constructs_model_clients(self):
        selected = {'episodes': []}
        with patch.object(runner, 'open_fixture_driver', side_effect=AssertionError):
            result = asyncio.run(runner.run(selected, argparse.Namespace(live=False)))
        self.assertEqual(result['derivation']['mode'], 'unavailable')
        self.assertEqual(result['artifacts'], [])
        self.assertIs(result['selected'], selected)

    def test_absent_model_configuration_has_zero_semantic_claims(self):
        with patch.dict(os.environ, {}, clear=True), patch.object(runner, 'open_fixture_driver', side_effect=AssertionError):
            result = asyncio.run(runner.run({'episodes': []}, argparse.Namespace(live=True)))
        self.assertEqual(result['derivation']['mode'], 'unavailable')
        self.assertEqual(result['artifacts'], [])
        self.assertIn('OPENAI_API_KEY', result['loss'][0])

    def test_effective_time_is_required_before_any_graph_mutation(self):
        configured = dict(OPENAI_API_KEY='test-secret', TRACE_GRAPHITI_MODEL='fixture-model',
                          TRACE_GRAPHITI_EMBEDDER='fixture-embedder', TRACE_GRAPHITI_RERANKER='fixture-reranker',
                          TRACE_GRAPH_ISOLATED='true')
        with patch.dict(os.environ, configured, clear=True), patch.object(runner, 'open_fixture_driver', side_effect=AssertionError):
            result = asyncio.run(runner.run({'episodes': [{'effectiveAt': None}]}, argparse.Namespace(live=True)))
        self.assertEqual(result['derivation']['mode'], 'unavailable')
        self.assertIn('effective time', result['loss'][0])
        self.assertNotIn('test-secret', str(result))

    def test_donor_outage_degrades_without_leaking_errors_or_configuration(self):
        configured = dict(OPENAI_API_KEY='test-secret', TRACE_GRAPHITI_MODEL='fixture-model',
                          TRACE_GRAPHITI_EMBEDDER='fixture-embedder', TRACE_GRAPHITI_RERANKER='fixture-reranker',
                          TRACE_GRAPH_ISOLATED='true')
        selected = {'episodes': [{'effectiveAt': '2000-01-01T00:00:00.000Z'}]}
        with patch.dict(os.environ, configured, clear=True), patch.object(runner, 'open_fixture_driver', AsyncMock(side_effect=ConnectionError('test-secret private-endpoint'))):
            result = asyncio.run(runner.run(selected, argparse.Namespace(live=True)))
        self.assertEqual(result['artifacts'], [])
        self.assertEqual(result['derivation']['mode'], 'unavailable')
        self.assertIn('ConnectionError', result['loss'][0])
        self.assertNotIn('test-secret', str(result))
        self.assertNotIn('private-endpoint', str(result))

    def test_operational_graph_config_cannot_redirect_semantic_jurisdiction(self):
        with patch.dict(os.environ, {'TRACE_GRAPH_ISOLATED': 'true', 'TRACE_FALKORDB_GRAPH': 'entif_trace_1735'}, clear=True):
            self.assertEqual(runner.fixture_config()['graphName'], 'entif_graphiti_1737')
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(ValueError, 'ownership'):
                runner.fixture_config()


if __name__ == '__main__':
    unittest.main()
