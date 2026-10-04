"""Concrete provider configuration for the fixture; #353 owns the general broker."""
import hashlib
import json
import os
from types import SimpleNamespace
from datetime import datetime, timezone
from urllib.parse import urlsplit


def digest(value):
    return hashlib.sha256(value if isinstance(value, bytes) else json.dumps(value, sort_keys=True).encode()).hexdigest()


def now():
    return datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')


def provider_settings():
    provider = os.environ.get('TRACE_GRAPHITI_PROVIDER', 'openai')
    if provider not in ('openai', 'lmstudio'):
        raise ValueError('Unsupported explicit provider profile.')
    names = ['TRACE_GRAPHITI_MODEL', 'TRACE_GRAPHITI_EMBEDDER', 'TRACE_GRAPHITI_RERANKER']
    if provider == 'lmstudio':
        names += ['TRACE_GRAPHITI_BASE_URL', 'TRACE_GRAPHITI_ENDPOINT_REF', 'TRACE_GRAPHITI_HOST_REF']
    else:
        names += ['OPENAI_API_KEY']
    if any(not os.environ.get(name) for name in names):
        raise ValueError('Missing explicit provider configuration: ' + ', '.join(name for name in names if not os.environ.get(name)))
    base_url = os.environ.get('TRACE_GRAPHITI_BASE_URL')
    if provider == 'lmstudio':
        url = urlsplit(base_url)
        if (url.scheme != 'http' or url.hostname not in ('127.0.0.1', '::1', 'localhost')
                or url.username or url.password or url.query or url.fragment or url.path.rstrip('/') != '/v1'):
            raise ValueError('LM Studio fixture requires a loopback /v1 endpoint without embedded credentials.')
    return dict(provider=provider, baseUrl=base_url, apiKey=os.environ.get('OPENAI_API_KEY') or 'not-required',
                endpointRef=os.environ.get('TRACE_GRAPHITI_ENDPOINT_REF', 'endpoint:openai'),
                hostRef=os.environ.get('TRACE_GRAPHITI_HOST_REF', 'host:provider'),
                credentialRef='env:OPENAI_API_KEY' if os.environ.get('OPENAI_API_KEY') else None,
                model=os.environ['TRACE_GRAPHITI_MODEL'], embedder=os.environ['TRACE_GRAPHITI_EMBEDDER'],
                reranker=os.environ['TRACE_GRAPHITI_RERANKER'])


def public_config(settings, dimension):
    if type(dimension) is not int or dimension <= 0:
        raise ValueError('Embedding dimension must be discovered from a successful embedding response.')
    return dict(provider=settings['provider'], apiProfile='openai-compatible', endpointRef=settings['endpointRef'],
                inferenceHostRef=settings['hostRef'], locality='loopback' if settings['provider'] == 'lmstudio' else 'remote',
                credentialRef=settings['credentialRef'], model=settings['model'], embedder=settings['embedder'],
                embeddingDimension=dimension, reranker=settings['reranker'],
                structuredOutputMode='json_schema', schemaIncludedInPrompt=settings['provider'] == 'lmstudio',
                reasoningEffort='none' if settings['provider'] == 'lmstudio' else None,
                temperature=0, maxTokens=4096, requestTimeoutSeconds=90, sdkRetries=0,
                supportPolicy='conservative-cumulative-selected-context',
                rerankerClient='graphiti_core.cross_encoder.openai_reranker_client.OpenAIRerankerClient')


def configure_provider_client(sdk, provider):
    if provider != 'lmstudio':
        return sdk

    async def complete(**kwargs):
        # Native constrained output does not show its schema to the reasoning model.
        # Make that same requested schema explicit, using only SDK request options.
        options = dict(kwargs, reasoning_effort='none')
        schema = options.get('response_format', {}).get('json_schema', {}).get('schema')
        if schema:
            messages = [dict(m) for m in options['messages']]
            messages[-1]['content'] += '\nReturn JSON conforming to this requested schema:\n' + json.dumps(schema)
            options['messages'] = messages
        return await sdk.chat.completions.create(**options)

    return SimpleNamespace(models=sdk.models, embeddings=sdk.embeddings, close=sdk.close,
                           chat=SimpleNamespace(completions=SimpleNamespace(create=complete)))


def provider_client(settings, receipts, phase):
    import httpx
    from openai import AsyncOpenAI

    async def observe(response):
        # Never copy headers, URLs, credentials, prompts, or exception bodies to evidence.
        await response.aread()
        if response.request.method != 'POST':
            return
        body = json.loads(response.content) if response.is_success else {}
        request = json.loads(response.request.content)
        receipts.append(dict(phase=phase['name'], observedAt=now(), endpointRef=settings['endpointRef'],
                             operation=response.request.url.path.rsplit('/', 1)[-1], status=response.status_code,
                             requestDigest=digest(response.request.content), responseDigest=digest(response.content),
                             requestedModel=request.get('model'), responseId=body.get('id'), responseModel=body.get('model'),
                             requestMaxTokens=request.get('max_tokens'), structuredOutputMode=request.get('response_format', {}).get('type'),
                             logprobsRequested=request.get('logprobs', False),
                             reasoningEffort=request.get('reasoning_effort'),
                             providerCreatedAt=body.get('created'), systemFingerprint=body.get('system_fingerprint'),
                             usage=body.get('usage'), finishReasons=[c.get('finish_reason') for c in body.get('choices', [])]))

    transport = httpx.AsyncClient(timeout=90, trust_env=False, event_hooks={'response': [observe]})
    sdk = AsyncOpenAI(api_key=settings['apiKey'], base_url=settings['baseUrl'], http_client=transport,
                      max_retries=0, timeout=90)
    return configure_provider_client(sdk, settings['provider'])


def graphiti_clients(settings, client, dimension):
    from graphiti_core.llm_client.config import LLMConfig
    from graphiti_core.llm_client.openai_client import OpenAIClient
    from graphiti_core.llm_client.openai_generic_client import OpenAIGenericClient
    from graphiti_core.embedder.openai import OpenAIEmbedder, OpenAIEmbedderConfig
    from graphiti_core.cross_encoder.openai_reranker_client import OpenAIRerankerClient
    config = LLMConfig(model=settings['model'], small_model=settings['model'], temperature=0,
                       api_key=settings['apiKey'], base_url=settings['baseUrl'])
    llm = (OpenAIGenericClient(config=config, client=client, max_tokens=4096, structured_output_mode='json_schema')
           if settings['provider'] == 'lmstudio' else OpenAIClient(config=config, client=client))
    return dict(llm_client=llm,
                embedder=OpenAIEmbedder(config=OpenAIEmbedderConfig(embedding_model=settings['embedder'], embedding_dim=dimension), client=client),
                cross_encoder=OpenAIRerankerClient(config=LLMConfig(model=settings['reranker']), client=client))


async def probe_provider(settings, client):
    from typing import Literal
    from pydantic import BaseModel
    from graphiti_core.llm_client.config import LLMConfig
    from graphiti_core.llm_client.openai_generic_client import OpenAIGenericClient
    from graphiti_core.prompts.models import Message

    inventory = await client.models.list()
    discovered = sorted(model.id for model in inventory.data)
    if any(model not in discovered for model in (settings['model'], settings['embedder'], settings['reranker'])):
        raise ValueError('Explicit configured model is absent from discovered provider inventory.')

    class Probe(BaseModel):
        ready: Literal[True]
        entity: Literal['Cedar']

    mode = 'json_schema'
    llm = OpenAIGenericClient(config=LLMConfig(model=settings['model'], temperature=0), client=client,
                              max_tokens=1024, structured_output_mode=mode)
    started = now()
    result = await llm.generate_response([Message(role='system', content='Return the requested JSON object.'),
                                         Message(role='user', content='Return ready true and entity Cedar.')], response_model=Probe)
    Probe.model_validate(result)
    embedding = await client.embeddings.create(model=settings['embedder'], input=['Cedar is a bounded fixture.'])
    vector = embedding.data[0].embedding
    if not vector or not all(isinstance(v, (int, float)) for v in vector):
        raise ValueError('Provider returned no compatible embedding vector.')
    return dict(startedAt=started, completedAt=now(), discoveredModelIds=discovered, structuredOutput=result,
                structuredOutputPosture=mode + ' requested; actual response locally validated',
                embeddingDimension=len(vector), embeddingModel=embedding.model, embeddingDigest=digest(vector))
