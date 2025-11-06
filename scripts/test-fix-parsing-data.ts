export const TestFixParsingFiles = [
  {
    path: 'src/index.ts',
    contents:
      "import { helper } from './utils';\nimport { fetchData } from './importnonexistent';\n\nconst message = \"Hello world\n\nconsole.log(message);\nconsole.log(helper());\nconsole.log(fetchData());",
  },
  {
    path: 'src/utils.ts',
    contents: "export function helper() {\n  const data = {name: 'test, value: 42};\n  return data;\n}",
  },
  {
    path: 'src/importnonexistent.ts',
    contents:
      "import { someFunction } from 'non-existent-package';\nimport { anotherThing } from './missing-local-file';\n\nexport function fetchData() {\n  const result = someFunction();\n  return anotherThing(result);\n}\n\nexport const config = {\n  apiUrl: 'https://api.example.com',\n  timeout: 5000\n};",
  },
];
