import os
import unittest
from unittest.mock import patch

from graphiti_provider import provider_settings, public_config


LOCAL = dict(TRACE_GRAPHITI_PROVIDER='lmstudio', TRACE_GRAPHITI_BASE_URL='http://127.0.0.1:1234/v1',
             TRACE_GRAPHITI_ENDPOINT_REF='endpoint:lmstudio-m3-ultra', TRACE_GRAPHITI_HOST_REF='host:m3-ultra',
             TRACE_GRAPHITI_MODEL='discovered-chat', TRACE_GRAPHITI_EMBEDDER='discovered-embedding',
             TRACE_GRAPHITI_RERANKER='discovered-chat')


class ProviderBoundary(unittest.TestCase):
    def test_loopback_provider_does_not_require_a_cloud_credential(self):
        with patch.dict(os.environ, LOCAL, clear=True):
            settings = provider_settings()
        self.assertEqual(settings['provider'], 'lmstudio')
        self.assertEqual(settings['baseUrl'], LOCAL['TRACE_GRAPHITI_BASE_URL'])
        self.assertEqual(settings['model'], 'discovered-chat')

    def test_portable_identity_excludes_addresses_and_credentials(self):
        with patch.dict(os.environ, dict(LOCAL, OPENAI_API_KEY='secret-sentinel'), clear=True):
            config = public_config(provider_settings(), 768)
        self.assertEqual(config['endpointRef'], 'endpoint:lmstudio-m3-ultra')
        self.assertEqual(config['embeddingDimension'], 768)
        self.assertNotIn('secret-sentinel', str(config))
        self.assertNotIn('127.0.0.1', str(config))
        self.assertEqual(config['structuredOutputMode'], 'json_schema')

    def test_missing_identity_or_nonloopback_endpoint_fails_closed(self):
        for change in [dict(TRACE_GRAPHITI_ENDPOINT_REF=''), dict(TRACE_GRAPHITI_HOST_REF=''),
                       dict(TRACE_GRAPHITI_BASE_URL='http://192.168.0.92:1234/v1'),
                       dict(TRACE_GRAPHITI_BASE_URL='http://secret@127.0.0.1:1234/v1'),
                       dict(TRACE_GRAPHITI_BASE_URL='http://127.0.0.1:1234/v1?token=secret')]:
            with self.subTest(change=change), patch.dict(os.environ, dict(LOCAL, **change), clear=True):
                with self.assertRaises(ValueError):
                    provider_settings()

    def test_embedding_dimension_cannot_be_assumed(self):
        with patch.dict(os.environ, LOCAL, clear=True):
            settings = provider_settings()
        for dimension in [None, 0, -1, True, 768.5]:
            with self.subTest(dimension=dimension), self.assertRaises(ValueError):
                public_config(settings, dimension)


if __name__ == '__main__':
    unittest.main()
