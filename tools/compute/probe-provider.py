"""Reuse the accepted local Graphiti capability probe without exporting secrets."""
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, 'tools/trace-temporal')
from graphiti_provider import provider_settings, provider_client, probe_provider


async def main():
    settings = provider_settings()
    receipts = []
    client = provider_client(settings, receipts, {'name': 'remote-compute-preflight'})
    try:
        result = await asyncio.wait_for(probe_provider(settings, client), 120)
        result['responseProvenance'] = receipts
        with Path(sys.argv[1]).open('x') as file:
            json.dump(result, file)
    finally:
        await client.close()


if __name__ == '__main__':
    asyncio.run(main())
