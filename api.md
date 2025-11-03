# Fixer

Types:

- <code><a href="./src/resources/fixer.ts">FixerRunResponse</a></code>

Methods:

- <code title="post /v1/fixer">client.fixer.<a href="./src/resources/fixer.ts">run</a>({ ...params }) -> FixerRunResponse</code>

# Stacks

Types:

- <code><a href="./src/resources/stacks.ts">StackCreateResponse</a></code>
- <code><a href="./src/resources/stacks.ts">StackRetrieveResponse</a></code>
- <code><a href="./src/resources/stacks.ts">StackUpdateResponse</a></code>
- <code><a href="./src/resources/stacks.ts">StackCreateAndRunResponse</a></code>
- <code><a href="./src/resources/stacks.ts">StackExecuteCommandResponse</a></code>
- <code><a href="./src/resources/stacks.ts">StackGetLogsResponse</a></code>
- <code><a href="./src/resources/stacks.ts">StackGetNetworkInfoResponse</a></code>
- <code><a href="./src/resources/stacks.ts">StackWaitForDevServerURLResponse</a></code>

Methods:

- <code title="post /v1/stacks">client.stacks.<a href="./src/resources/stacks.ts">create</a>({ ...params }) -> StackCreateResponse</code>
- <code title="get /v1/stacks/{id}">client.stacks.<a href="./src/resources/stacks.ts">retrieve</a>(id) -> StackRetrieveResponse</code>
- <code title="post /v1/stacks/{id}/patch">client.stacks.<a href="./src/resources/stacks.ts">update</a>(id, { ...params }) -> StackUpdateResponse</code>
- <code title="post /v1/stacks/create-and-run">client.stacks.<a href="./src/resources/stacks.ts">createAndRun</a>({ ...params }) -> StackCreateAndRunResponse</code>
- <code title="delete /v1/stacks/{id}">client.stacks.<a href="./src/resources/stacks.ts">destroy</a>(id) -> void</code>
- <code title="post /v1/stacks/{id}/exec">client.stacks.<a href="./src/resources/stacks.ts">executeCommand</a>(id, { ...params }) -> StackExecuteCommandResponse</code>
- <code title="get /v1/stacks/{id}/logs">client.stacks.<a href="./src/resources/stacks.ts">getLogs</a>(id, { ...params }) -> StackGetLogsResponse</code>
- <code title="get /v1/stacks/{id}/network-info">client.stacks.<a href="./src/resources/stacks.ts">getNetworkInfo</a>(id) -> StackGetNetworkInfoResponse</code>
- <code title="get /v1/stacks/{id}/wait-url">client.stacks.<a href="./src/resources/stacks.ts">waitForDevServerURL</a>(id, { ...params }) -> StackWaitForDevServerURLResponse</code>

# FixStringLiterals

Types:

- <code><a href="./src/resources/fix-string-literals.ts">FixStringLiteralCreateResponse</a></code>

Methods:

- <code title="post /v1/fix-string-literals">client.fixStringLiterals.<a href="./src/resources/fix-string-literals.ts">create</a>({ ...params }) -> FixStringLiteralCreateResponse</code>

# ValidateTemplate

Types:

- <code><a href="./src/resources/validate-template.ts">ValidateTemplateValidateResponse</a></code>

Methods:

- <code title="post /v1/validate-template">client.validateTemplate.<a href="./src/resources/validate-template.ts">validate</a>({ ...params }) -> ValidateTemplateValidateResponse</code>
