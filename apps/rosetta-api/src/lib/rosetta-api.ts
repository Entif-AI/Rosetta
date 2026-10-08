import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import { buildBootstrapDemoSnapshot } from '@entif-ai/ingress-refinery';
import { listSchemaCatalogEntries } from '@entif-ai/rosetta-schemas';
import { loadBootstrapSourceRegistry } from '@entif-ai/source-registry';
import type { LocalCredentialMediator } from '@entif-ai/rosetta-guard';

export interface LocalExecutionRegistration {
  mediator: LocalCredentialMediator;
  /** The workload/ingress owner authenticates transport; requests cannot declare their own subject. */
  authenticate(request: IncomingMessage): { subjectRef: string } | null;
}
export interface RosettaApiOptions { execution?: LocalExecutionRegistration }

export interface RosettaApiRouteResult {
  body: unknown;
  statusCode: number;
}

const registry = loadBootstrapSourceRegistry();

export function routeRosettaApi(url?: string): RosettaApiRouteResult {
  if (!url) {
    return {
      body: { error: 'missing url' },
      statusCode: 400
    };
  }

  if (url === '/health') {
    return {
      body: { ok: true, service: 'rosetta-api' },
      statusCode: 200
    };
  }

  if (url === '/registry') {
    return {
      body: registry,
      statusCode: 200
    };
  }

  if (url === '/demo') {
    return {
      body: buildBootstrapDemoSnapshot(),
      statusCode: 200
    };
  }

  if (url === '/schemas') {
    return {
      body: {
        entries: listSchemaCatalogEntries(),
        note: 'Inspection endpoint only; exposureStatus values describe catalog visibility and do not imply runtime support.'
      },
      statusCode: 200
    };
  }

  return {
    body: { error: 'not found' },
    statusCode: 404
  };
}

function json(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { 'content-type': 'application/json' }); response.end(JSON.stringify(body));
}
function localRequest(request: IncomingMessage): boolean {
  if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.socket.remoteAddress ?? '')) return false;
  if (!/^(localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/i.test(request.headers.host ?? '')) return false;
  if (request.headers.origin) {
    try { const origin = new URL(request.headers.origin); if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password || !['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname)) return false; }
    catch { return false; }
  }
  return true;
}
function boundedBody(request: IncomingMessage): Promise<Buffer | null> {
  return new Promise(resolve => {
    let length = 0; let overflow = false; const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => { length += chunk.length; if (length > 16_384) { if (!overflow) { overflow = true; chunks.length = 0; resolve(null); } } else if (!overflow) chunks.push(chunk); });
    request.on('end', () => { if (!overflow) resolve(Buffer.concat(chunks)); }); request.on('error', () => resolve(null)); request.on('aborted', () => resolve(null));
  });
}
async function handleExecution(request: IncomingMessage, response: ServerResponse, registration: LocalExecutionRegistration) {
  if (!localRequest(request)) return json(response, 403, { code: 'LOCAL_TRANSPORT_REFUSED' });
  const method = request.url === '/authz/tools' ? 'GET' : 'POST';
  if (request.method !== method) return json(response, 405, { code: 'METHOD_REFUSED' });
  let actor: { subjectRef: string } | null; try { actor = registration.authenticate(request); } catch { actor = null; }
  if (!actor) return json(response, 401, { code: 'AUTHENTICATED_WORKLOAD_REQUIRED' });
  if (actor.subjectRef !== registration.mediator.subjectRef) return json(response, 403, { code: 'ACTOR_SUBJECT_MISMATCH' });
  if (method === 'GET') return json(response, 200, registration.mediator.discover());
  if (!request.headers['content-type']?.startsWith('application/json')) return json(response, 415, { code: 'JSON_REQUIRED' });
  const bytes = await boundedBody(request); if (!bytes) return json(response, 413, { code: 'REQUEST_BODY_BOUND_EXCEEDED' });
  let input: unknown; try { input = JSON.parse(bytes.toString('utf8')); } catch { return json(response, 400, { code: 'UNINTERPRETABLE_EXECUTION_INTENT' }); }
  try {
    const result = await registration.mediator.execute(input);
    return json(response, result.code === 'EXECUTED' ? 200 : result.code === 'ENTIF_AUTHORITY_DENIED' ? 403 : 409, result);
  } catch (error) {
    return error instanceof Error && error.message === 'UNINTERPRETABLE_EXECUTION_INTENT' ? json(response, 400, { code: 'UNINTERPRETABLE_EXECUTION_INTENT' }) : json(response, 503, { code: 'CURRENT_EXECUTION_UNRESOLVED' });
  }
}
export function handleRosettaApiRequest(request: IncomingMessage, response: ServerResponse, options: RosettaApiOptions = {}): void {
  if (options.execution && ['/authz/tools', '/authz/execute'].includes(request.url ?? '')) {
    void handleExecution(request, response, options.execution).catch(() => { if (!response.headersSent) json(response, 503, { code: 'CURRENT_EXECUTION_UNRESOLVED' }); else response.end(); });
    return;
  }
  const result = routeRosettaApi(request.url);
  response.writeHead(result.statusCode, { 'content-type': 'application/json' });
  response.end(JSON.stringify(result.body, null, 2));
}

export function createRosettaApiServer(options: RosettaApiOptions = {}): Server {
  return createServer((request, response) => handleRosettaApiRequest(request, response, options));
}
