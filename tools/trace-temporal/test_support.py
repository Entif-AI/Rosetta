import asyncio
import json
import sys
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from graphiti_support import extract_selected


class Item:
    def __init__(self, uuid, **fields):
        self.uuid = uuid
        self.fields = fields

    def model_dump(self, mode):
        return dict(uuid=self.uuid, **self.fields)


class DonorMapping(unittest.TestCase):
    def test_duplicate_delivery_and_invalidation_retain_selected_support(self):
        episodes = [dict(id='selected-1', content='first', effectiveAt='2000-01-01T00:00:00.000Z'),
                    dict(id='selected-2', content='change', effectiveAt='2000-01-03T00:00:00.000Z')]
        result1 = SimpleNamespace(episode=Item('donor-1'), nodes=[], episodic_edges=[],
                                  edges=[Item('fact-1', episodes=['donor-1'], valid_at='2000-01-01T00:00:00.000Z', invalid_at=None)])
        result2 = SimpleNamespace(episode=Item('donor-2'), nodes=[], episodic_edges=[],
                                  edges=[Item('fact-1', episodes=['donor-1', 'donor-2'], valid_at='2000-01-01T00:00:00.000Z', invalid_at='2000-01-03T00:00:00.000Z')])
        donor = SimpleNamespace(add_episode=AsyncMock(side_effect=[result1, result2]))
        with patch.dict(sys.modules, {'graphiti_core.nodes': SimpleNamespace(EpisodeType=SimpleNamespace(json='json'))}):
            artifacts = asyncio.run(extract_selected(donor, {'episodes': [episodes[0], episodes[0], episodes[1]]}, 'entif_graphiti_1737'))
        self.assertEqual(donor.add_episode.await_count, 2)
        self.assertTrue(all(call.kwargs['group_id'] == 'entif_graphiti_1737' for call in donor.add_episode.call_args_list))
        facts = [a for a in artifacts if a['kind'] == 'fact']
        self.assertEqual(facts[1]['supersedes'], [facts[0]['id']])
        self.assertEqual(facts[1]['validUntil'], '2000-01-03T00:00:00.000Z')
        self.assertEqual(facts[1]['validUntilKnownAt'], facts[1]['materializedAt'])
        self.assertEqual(facts[1]['validUntilSupportEpisodeIds'], ['selected-1', 'selected-2'])
        self.assertEqual(json.loads(facts[0]['interpretation'])['invalid_at'], None)
        self.assertEqual(facts[1]['identity'], 'unresolved')

    def test_foreign_donor_support_is_rejected(self):
        result = SimpleNamespace(episode=Item('donor-1'), nodes=[], episodic_edges=[],
                                 edges=[Item('fact', episodes=['unselected-donor'])])
        donor = SimpleNamespace(add_episode=AsyncMock(return_value=result))
        with patch.dict(sys.modules, {'graphiti_core.nodes': SimpleNamespace(EpisodeType=SimpleNamespace(json='json'))}), self.assertRaisesRegex(ValueError, 'outside admitted'):
            asyncio.run(extract_selected(donor, {'episodes': [dict(id='selected-1', content='x', effectiveAt='2000-01-01T00:00:00.000Z')]}, 'entif_graphiti_1737'))


if __name__ == '__main__':
    unittest.main()
