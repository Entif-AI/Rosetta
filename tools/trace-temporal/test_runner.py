import argparse
import asyncio
import importlib.util
import os
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('runner', Path(__file__).with_name('graphiti_runner.py'))
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)


class DegradedRuntime(unittest.TestCase):
    def test_model_off_never_constructs_clients(self):
        selected = {'profile': 'fixture', 'episodes': []}
        result = asyncio.run(runner.run(selected, argparse.Namespace(live=False)))
        self.assertEqual(result['derivation']['mode'], 'unavailable')
        self.assertEqual(result['artifacts'], [])
        self.assertIs(result['selected'], selected)

    def test_missing_credentials_are_explicit_without_echoing_environment(self):
        with patch.dict(os.environ, {}, clear=True):
            result = asyncio.run(runner.run({'episodes': []}, argparse.Namespace(live=True)))
        self.assertEqual(result['derivation']['mode'], 'unavailable')
        self.assertIn('OPENAI_API_KEY', result['loss'][0])
        self.assertEqual(result['artifacts'], [])


if __name__ == '__main__':
    unittest.main()
