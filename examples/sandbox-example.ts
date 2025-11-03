// Example usage of the Benchify Sandbox API

import { Benchify } from '../src';

async function main() {
  // Initialize the client
  const client = new Benchify({
    apiKey: process.env['BENCHIFY_API_KEY'],
  });

  // Prepare files for the sandbox
  const files = [
    {
      path: 'src/index.ts',
      contents: `
import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Benchify Sandbox!' });
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});
      `.trim(),
    },
    {
      path: 'package.json',
      contents: JSON.stringify(
        {
          name: 'sandbox-example',
          version: '1.0.0',
          main: 'dist/index.js',
          scripts: {
            build: 'tsc',
            start: 'node dist/index.js',
            dev: 'ts-node src/index.ts',
          },
          dependencies: {
            express: '^4.18.0',
          },
          devDependencies: {
            '@types/express': '^4.17.0',
            '@types/node': '^18.0.0',
            typescript: '^4.9.0',
            'ts-node': '^10.9.0',
          },
        },
        null,
        2,
      ),
    },
    {
      path: 'tsconfig.json',
      contents: JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2020',
            module: 'commonjs',
            outDir: './dist',
            rootDir: './src',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
          },
          include: ['src/**/*'],
        },
        null,
        2,
      ),
    },
  ];

  try {
    console.log('Creating sandbox...');

    // Create a sandbox with ergonomic options
    const handle = await client.stack.create(files, {
      name: 'my-express-app',
      port: 3000,
      buildCommand: 'npm run build',
      startCommand: 'npm start',
      runtime: {
        nodeVersion: '18.x',
        packageManager: 'npm',
        framework: 'express',
      },
    });

    console.log(`✅ Sandbox created successfully!`);
    console.log(`   ID: ${handle.id}`);
    console.log(`   URL: ${handle.url}`);
    console.log(`   Kind: ${handle.kind}`);

    // Check initial status
    const initialStatus = await handle.status();
    console.log(`   Phase: ${initialStatus.phase}`);

    // Apply some changes
    console.log('\n🔄 Applying changes...');

    await handle.apply([
      {
        path: 'src/index.ts',
        contents: `
import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from Updated Benchify Sandbox!',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(\`Updated server running at http://localhost:\${port}\`);
});
        `.trim(),
      },
      {
        path: 'src/utils.ts',
        contents: `
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function createResponse(message: string, data?: any) {
  return {
    message,
    timestamp: getCurrentTimestamp(),
    data,
  };
}
        `.trim(),
      },
    ]);

    console.log('✅ Changes applied successfully!');

    // Check status after changes
    const updatedStatus = await handle.status();
    console.log(`   New Phase: ${updatedStatus.phase}`);

    // Wait a bit and check final status
    console.log('\n⏳ Waiting for sandbox to be ready...');
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const status = await handle.status();
      console.log(`   Status check ${attempts + 1}: ${status.phase}`);

      if (status.phase === 'running') {
        console.log('🎉 Sandbox is now running!');
        if (status.readyAt) {
          console.log(`   Ready at: ${status.readyAt}`);
        }
        break;
      } else if (status.phase === 'failed') {
        console.log('❌ Sandbox failed to start');
        if (status.lastError) {
          console.log(`   Error: ${status.lastError}`);
        }
        break;
      }

      attempts++;
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Demonstrate delete operation (commented out to keep sandbox running)
    // console.log('\n🗑️ Cleaning up sandbox...');
    // await handle.destroy();
    // console.log('✅ Sandbox destroyed successfully!');

    console.log('\n✨ Example completed! Check the sandbox URL to see your running app.');
  } catch (error) {
    console.error('❌ Error:', error);

    // If it's a normalized sandbox error, show details
    if (error && typeof error === 'object' && 'code' in error) {
      console.error(`   Code: ${error.code}`);
      if ('message' in error) {
        console.error(`   Message: ${error.message}`);
      }
      if ('requestId' in error && error.requestId) {
        console.error(`   Request ID: ${error.requestId}`);
      }
    }
  }
}

// Example of handling conflicts during concurrent edits
async function conflictHandlingExample() {
  const client = new Benchify({
    apiKey: process.env['BENCHIFY_API_KEY'],
  });

  const files = [
    {
      path: 'README.md',
      contents: '# My Project\n\nInitial content.',
    },
  ];

  try {
    const handle = await client.stack.create(files, {
      name: 'conflict-example',
    });

    console.log('Testing conflict handling...');

    // This will automatically handle 409 conflicts with retry
    await handle.apply([
      {
        path: 'README.md',
        contents: '# My Updated Project\n\nThis content was updated and conflicts are handled automatically!',
      },
    ]);

    console.log('✅ Conflict handling test completed successfully!');
  } catch (error) {
    console.error('❌ Conflict handling test failed:', error);
  }
}

// Example for stack (multi-service) sandboxes
async function stackExample() {
  const client = new Benchify({
    apiKey: process.env['BENCHIFY_API_KEY'],
  });

  // Stack with frontend and backend
  const files = [
    // Frontend files
    {
      path: 'frontend/src/App.tsx',
      contents: `
import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Frontend Service</h1>
      <p>Running in Benchify Stack!</p>
    </div>
  );
}

export default App;
      `.trim(),
    },
    {
      path: 'frontend/package.json',
      contents: JSON.stringify(
        {
          name: 'frontend',
          version: '1.0.0',
          dependencies: {
            react: '^18.0.0',
            'react-dom': '^18.0.0',
          },
          scripts: {
            start: 'react-scripts start',
            build: 'react-scripts build',
          },
        },
        null,
        2,
      ),
    },
    // Backend files
    {
      path: 'backend/src/server.ts',
      contents: `
import express from 'express';
import cors from 'cors';

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({ status: 'Backend service is running!' });
});

app.listen(port, () => {
  console.log(\`Backend running at http://localhost:\${port}\`);
});
      `.trim(),
    },
    {
      path: 'backend/package.json',
      contents: JSON.stringify(
        {
          name: 'backend',
          version: '1.0.0',
          dependencies: {
            express: '^4.18.0',
            cors: '^2.8.5',
          },
          devDependencies: {
            '@types/express': '^4.17.0',
            '@types/cors': '^2.8.0',
            typescript: '^4.9.0',
            'ts-node': '^10.9.0',
          },
          scripts: {
            start: 'ts-node src/server.ts',
            build: 'tsc',
          },
        },
        null,
        2,
      ),
    },
  ];

  try {
    console.log('Creating stack sandbox...');

    const handle = await client.stack.create(files, {
      name: 'my-fullstack-app',
      runtime: {
        nodeVersion: '18.x',
        packageManager: 'npm',
      },
    });

    console.log(`✅ Stack created: ${handle.url}`);
    console.log(`   Kind: ${handle.kind}`);
    console.log(`   Stack ID: ${handle.stackId}`);

    // Apply changes to both services through the same handle
    await handle.apply([
      {
        path: 'frontend/src/App.tsx',
        contents: `
import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Updated Frontend Service</h1>
      <p>Stack changes applied through single API!</p>
      <p>Version: 2.0.0</p>
    </div>
  );
}

export default App;
        `.trim(),
      },
      {
        path: 'backend/src/server.ts',
        contents: `
import express from 'express';
import cors from 'cors';

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'Updated backend service is running!',
    version: '2.0.0'
  });
});

app.get('/api/info', (req, res) => {
  res.json({ 
    service: 'backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(\`Updated backend running at http://localhost:\${port}\`);
});
        `.trim(),
      },
    ]);

    console.log('✅ Stack changes applied successfully!');
  } catch (error) {
    console.error('❌ Stack example failed:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
