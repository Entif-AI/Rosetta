# Bounded local authority execution

The existing API can register a `LocalCredentialMediator` and an authentication
callback owned by the workload/ingress host. Registration is explicit; the
default server retains its existing inspection routes. The authenticated
subject must match the mediator's configured subject. Authentication creates
no grant, and a request cannot choose authority sources, provider credentials,
workflow gates or the effective subject.

`GET /authz/tools` returns current discovery evidence. `POST /authz/execute`
accepts the mediator's bounded intent and resolves authority again at handler
time, including any requested minimum revision. Cached discovery, an old
Authority Envelope, Evaluation or Receipt never restores revoked authority.
The mediator owns current authorization, independent write admission,
checkpoint, private credential selection, measured provider readback and
Receipt closure. The handler serializes bounded results, never raw exceptions.

Execution requires a loopback socket and loopback Host/Origin, the declared
method, authenticated workload, JSON and a body of at most 16 KiB. The host
must supply the authentication owner; this reference does not implement a
production ingress identity service. The stock listener remains loopback.

AXI disposition: `WRAP_EXISTING_INTERFACE`. This extends the existing bounded
API execution surface. It neither exposes the authority store nor raw mutation
mechanics. #1771 owns this executable leaf under #1762. #1674's preferred MCP
consumer retains its donor-first dependency on #1688; creating a second MCP
server would bypass that owner. The API is the existing alternative consumer
authorized by the operational program, and does not complete #1674.

Validation uses real HTTP, current local state, the mediator and a durable
reference provider. It measures target count/digest after execution and after
cached discovery is refused following revocation, and checks transport,
subject and request-bound refusals before effect. #1762 separately owns the
integrated authenticated actor and governed mutation proof.
