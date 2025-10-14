# Shared

Types:

- <code><a href="./src/resources/shared.ts">ResponseMeta</a></code>

# Fixer

Types:

- <code><a href="./src/resources/fixer.ts">DiagnosticResponse</a></code>
- <code><a href="./src/resources/fixer.ts">FixerFile</a></code>
- <code><a href="./src/resources/fixer.ts">FixerRunResponse</a></code>

Methods:

- <code title="post /v1/fixer">client.fixer.<a href="./src/resources/fixer.ts">run</a>({ ...params }) -> FixerRunResponse</code>

# Sandboxes

Types:

- <code><a href="./src/resources/sandboxes.ts">SandboxCreateResponse</a></code>
- <code><a href="./src/resources/sandboxes.ts">SandboxRetrieveResponse</a></code>
- <code><a href="./src/resources/sandboxes.ts">SandboxUpdateResponse</a></code>

Methods:

- <code title="post /sandboxes">client.sandboxes.<a href="./src/resources/sandboxes.ts">create</a>({ ...params }) -> SandboxCreateResponse</code>
- <code title="get /sandboxes/{id}">client.sandboxes.<a href="./src/resources/sandboxes.ts">retrieve</a>(id) -> SandboxRetrieveResponse</code>
- <code title="post /sandboxes/{id}:patch">client.sandboxes.<a href="./src/resources/sandboxes.ts">update</a>(id, { ...params }) -> SandboxUpdateResponse</code>
- <code title="delete /sandboxes/{id}">client.sandboxes.<a href="./src/resources/sandboxes.ts">delete</a>(id) -> void</code>
