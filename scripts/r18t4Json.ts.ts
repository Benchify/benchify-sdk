export const R18T4ExampleFiles = [
  {
    path: 'package.json',
    contents:
      '{\n  "name": "pricing-react18-tw4",\n  "private": true,\n  "version": "0.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1"\n  },\n  "devDependencies": {\n    "vite": "^5.4.0",\n    "@vitejs/plugin-react": "^4.3.0",\n    "tailwindcss": "^4.0.0",\n    "postcss": "^8.4.47",\n    "autoprefixer": "^10.4.20"\n  }\n}\n',
  },
  {
    path: 'vite.config.ts',
    contents:
      "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n",
  },
  {
    path: 'index.html',
    contents:
      '\n<html>\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Pricing</title>\n  </head>\n  <body class="bg-gray-50">\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>\n',
  },
  {
    path: 'postcss.config.js',
    contents: 'export default { plugins: { tailwindcss: {}, autoprefixer: {} } };\n',
  },
  {
    path: 'src/main.jsx',
    contents:
      "import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\ncreateRoot(document.getElementById('root')).render(<App />);\n",
  },
  {
    path: 'src/App.jsx',
    contents:
      'import React from \'react\';\nimport Pricing from \'./components/Pricing\';\n\nexport default function App() {\n  return (\n    <main className="min-h-screen">\n      <section className="mx-auto max-w-6xl px-4 py-16">\n        <header className="text-center mb-10">\n          <h1 className="text-4xl font-semibold tracking-tight">Pricing</h1>\n          <p className="text-gray-600 mt-3">Fair, transparent, no surprises.</p>\n        </header>\n        <Pricing />\n      </section>\n    </main>\n  );\n}\n',
  },
  {
    path: 'src/components/Pricing.jsx',
    contents:
      "import React from 'react';\n\nconst plans = [\n  { name: 'Free', m: 0, y: 0, features: ['100 runs / mo', 'Basic support'] },\n  { name: 'Pro', m: 39, y: 390, features: ['25k runs / mo', 'Team seats', 'Priority support'], featured: true },\n  { name: 'Enterprise', m: 129, y: 1290, features: ['Unlimited', 'SAML SSO', 'Dedicated CSM'] },\n];\n\nexport default function Pricing() {\n  const [yearly, setYearly] = React.useState(true);\n  return (\n    <div>\n      <div className=\"flex justify-center items-center gap-3 mb-8\">\n        <span className={!yearly ? 'font-semibold' : 'text-gray-600'}>Monthly</span>\n        <button onClick={() => setYearly(v => !v)} className=\"relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200\">\n          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow translate-x-${yearly ? '6' : '1'}`}></span>\n        </button>\n        <span className={yearly ? 'font-semibold' : 'text-gray-600'}>Yearly</span>\n      </div>\n\n      <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">\n        {plans.map(p => (\n          <div key={p.name} className={`rounded-2xl border ${p.featured ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'} bg-white p-6`}>\n            <h3 className=\"text-xl font-semibold\">{p.name}</h3>\n            <div className=\"mt-5 flex items-baseline gap-1\">\n              <span className=\"text-4xl font-semibold\">${yearly ? p.y : p.m}</span>\n              <span className=\"text-gray-500\">/{yearly ? 'yr' : 'mo'}</span>\n            </div>\n            <ul className=\"mt-6 space-y-2 text-sm\">\n              {p.features.map(f => <li key={f} className=\"flex items-center gap-2\">• <span>{f}</span></li>)}\n            </ul>\n            <button className={`mt-6 w-full rounded-xl px-4 py-2 font-medium ${p.featured ? 'bg-indigo-600 text-white' : 'bg-gray-900 text-white'}`}>Choose {p.name}</button>\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n}\n",
  },
  {
    path: 'src/index.css',
    contents: '@import "tailwindcss";\n',
  },
];
