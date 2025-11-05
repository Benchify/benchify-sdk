# Local Testing Scripts

## test-local.ts

Test your local SDK changes against your local API without deploying.

### Usage

**Basic usage** (assumes local API on port 3000):

```bash
npm run test:local
```

**Custom port:**

```bash
LOCAL_API_PORT=4000 npm run test:local
```

**Custom API key:**

```bash
BENCHIFY_API_KEY=your-key npm run test:local
```

**Both:**

```bash
LOCAL_API_PORT=4000 BENCHIFY_API_KEY=your-key npm run test:local
```

### What it tests

The script runs three test suites:

1. **Standard runFixer** - Tests multipart/tar.zst with ALL_FILES format
2. **Bundle mode** - Tests with `bundle: true` to verify bundled files
3. **DIFF format** - Tests with `response_format: 'DIFF'`

### Workflow

1. Make changes to SDK code in `src/`
2. Run `npm run test:local` (no build needed - uses ts-node)
3. See immediate results from your local API
4. Iterate quickly!

### Requirements

- Your local API must be running (e.g., `make dev` in benchify-api)
- Set `BENCHIFY_API_KEY` env var or script will use `test-key`

### Example Output

```
═══════════════════════════════════════════════════════════
🧪 Local SDK Test Suite
═══════════════════════════════════════════════════════════

🚀 Testing local SDK against local API...
   API: http://localhost:3000
   API Key: test-key...

📦 Test files:
   - src/index.ts (95 bytes)
   - src/utils.ts (89 bytes)
   - package.json (78 bytes)

🔧 Running fixer with multipart/tar.zst format...
✅ Success! (1234ms)

📄 Files returned: 3
   1. src/index.ts (95 bytes)
   2. src/utils.ts (89 bytes)
   3. package.json (78 bytes)

📊 Initial diagnostics: 2 files with issues
📊 Final diagnostics: 0 files with issues
```
