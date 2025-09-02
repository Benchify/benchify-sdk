import { spawnSync } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import * as ignore from 'ignore';

import { maybeFilter } from 'benchify-mcp/filtering';
import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'fixer',
  operation: 'write',
  tags: ['local'],
  httpMethod: 'post',
  httpPath: '/v1/fixer/local',
  operationId: 'fixer_api_local_post',
};

export const tool: Tool = {
  name: 'benchify.run_fix_local',
  description:
    'Run Benchify Fixer on local files without requiring file contents in the request. The server discovers and reads files from disk based on selection criteria.',
  inputSchema: {
    type: 'object',
    properties: {
      root: {
        type: 'string',
        title: 'Root Directory',
        description: 'Root directory to search from (optional, defaults to current working directory)',
      },
      selection: {
        type: 'object',
        title: 'File Selection',
        description: 'Criteria for selecting files to process',
        properties: {
          mode: {
            type: 'string',
            enum: ['staged', 'globs', 'changedSince', 'files'],
            title: 'Selection Mode',
            description:
              'How to select files: staged (git staged), globs (glob patterns), changedSince (git diff), or files (explicit list)',
            default: 'staged',
          },
          globs: {
            type: 'array',
            items: { type: 'string' },
            title: 'Glob Patterns',
            description: 'Glob patterns to match files (used when mode is "globs")',
            default: ['**/*.{ts,tsx,js,jsx}'],
          },
          files: {
            type: 'array',
            items: { type: 'string' },
            title: 'Explicit Files',
            description: 'Explicit list of files to process (used when mode is "files")',
          },
          changedSince: {
            type: 'string',
            title: 'Changed Since',
            description: 'Git reference to compare against (used when mode is "changedSince")',
            default: 'HEAD',
          },
        },
        required: ['mode'],
      },
      preset: {
        type: 'string',
        enum: ['agent_safe', 'full'],
        title: 'Fix Preset',
        description: 'Preset configuration for fixes',
        default: 'agent_safe',
      },
      fixes: {
        type: 'object',
        title: 'Fix Configuration',
        description: 'Override specific fixes (ignored if preset is present)',
        properties: {
          css: { type: 'boolean', title: 'CSS fixes' },
          imports: { type: 'boolean', title: 'Import fixes' },
          react: { type: 'boolean', title: 'React fixes' },
          stringLiterals: { type: 'boolean', title: 'String literal fixes' },
          tailwind: { type: 'boolean', title: 'Tailwind fixes' },
          tsSuggestions: { type: 'boolean', title: 'TypeScript suggestion fixes' },
        },
      },
      apply_format: {
        type: 'string',
        enum: ['CHANGED_FILES', 'DIFF', 'ALL_FILES'],
        title: 'Apply Format',
        description: 'Format for returned changes',
        default: 'CHANGED_FILES',
      },
      apply: {
        type: 'string',
        enum: ['none', 'server'],
        title: 'Apply Changes',
        description: 'Whether to apply changes to disk',
        default: 'none',
      },
      ignore: {
        type: 'array',
        items: { type: 'string' },
        title: 'Ignore Patterns',
        description: 'Patterns to ignore when selecting files',
        default: ['node_modules/**', '.git/**', '.next/**', 'dist/**', 'build/**'],
      },
      limits: {
        type: 'object',
        title: 'File Limits',
        description: 'Limits for file processing',
        properties: {
          max_file_bytes: { type: 'integer', title: 'Max file size in bytes', default: 100000 },
          max_total_bytes: { type: 'integer', title: 'Max total size in bytes', default: 1500000 },
          max_files: { type: 'integer', title: 'Max number of files', default: 500 },
        },
      },
      context: {
        type: 'object',
        title: 'Context Options',
        description: 'Additional context to include',
        properties: {
          autoIncludeConfigs: { type: 'boolean', title: 'Auto-include config files', default: true },
        },
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description: 'A jq filter to apply to the response to include certain fields',
      },
    },
    required: [],
  },
  annotations: {},
};

// Git helper functions
function git(root: string, args: string[]) {
  return spawnSync('git', args, { cwd: root, encoding: 'utf8' });
}

function stagedPaths(root: string) {
  const out = git(root, ['diff', '--name-only', '--cached']);
  return out.status === 0 ? out.stdout.split('\n').filter(Boolean) : [];
}

function changedSince(root: string, since: string) {
  const out = git(root, ['diff', '--name-only', since]);
  return out.status === 0 ? out.stdout.split('\n').filter(Boolean) : [];
}

// File selection and processing functions
async function pickFiles(root: string, sel: any, exts = ['.ts', '.tsx', '.js', '.jsx']) {
  let candidates: string[] = [];

  if (sel.mode === 'staged') {
    candidates = stagedPaths(root);
  } else if (sel.mode === 'changedSince') {
    candidates = changedSince(root, sel.changedSince || 'HEAD');
  } else if (sel.mode === 'globs') {
    candidates = await glob(sel.globs ?? ['**/*.{ts,tsx,js,jsx}'], { cwd: root, nodir: true });
  } else if (sel.mode === 'files') {
    candidates = sel.files ?? [];
  }

  const ig = ignore
    .default()
    .add(sel.ignore ?? ['node_modules/**', '.git/**', '.next/**', 'dist/**', 'build/**']);
  const filtered = candidates
    .map((p) => path.normalize(p))
    .filter((p) => !ig.ignores(p))
    .filter((p) => exts.indexOf(path.extname(p)) !== -1);

  return filtered.filter((item, pos) => filtered.indexOf(item) === pos);
}

async function readProjectFiles(root: string, files: string[], limits: any) {
  const maxFile = limits?.max_file_bytes ?? 100_000;
  const maxTotal = limits?.max_total_bytes ?? 1_500_000;
  const maxCount = limits?.max_files ?? 500;

  const out: { path: string; contents: string }[] = [];
  let total = 0;

  for (const rel of files.slice(0, maxCount)) {
    const abs = path.join(root, rel);
    try {
      const stat = await fs.stat(abs);
      if (!stat.isFile()) continue;
      if (stat.size === 0 || stat.size > maxFile) continue;

      const contents = await fs.readFile(abs, 'utf8');
      if (!contents.trim()) continue;

      const nextTotal = total + Buffer.byteLength(contents, 'utf8');
      if (nextTotal > maxTotal) break;

      out.push({ path: rel, contents });
      total = nextTotal;
    } catch (e) {
      // Skip files that can't be read
      continue;
    }
  }

  return out;
}

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const {
    root = process.cwd(),
    selection = { mode: 'staged' },
    preset = 'agent_safe',
    fixes,
    apply_format = 'CHANGED_FILES',
    apply = 'none',
    ignore,
    limits,
    context = { autoIncludeConfigs: true },
    jq_filter,
    ...rest
  } = (args as any) || {};

  try {
    // Collect files based on selection criteria
    let files = await pickFiles(root, { ...selection, ignore });

    // Optional auto-context
    if (context?.autoIncludeConfigs) {
      const configFiles = [
        'tsconfig.json',
        'tailwind.config.ts',
        'tailwind.config.js',
        'postcss.config.js',
        'postcss.config.ts',
        'package.json',
      ];
      for (const f of configFiles) {
        if (files.indexOf(f) === -1) {
          try {
            await fs.access(path.join(root, f));
            files.push(f);
          } catch {
            // Config file doesn't exist, skip
          }
        }
      }
    }

    const toSend = await readProjectFiles(root, files, limits);

    if (toSend.length === 0) {
      const result = {
        summary: {
          files_examined: 0,
          files_changed: 0,
          fixes_enabled: [],
          duration_ms: 0,
        },
        suggested_changes: {
          format: apply_format,
          changed_files: [],
          diff: '',
          all_files: [],
        },
        applied: false,
        write_errors: [],
      };
      return asTextContentResult(await maybeFilter(jq_filter, result));
    }

    // Determine fixes based on preset
    let fixConfig;
    if (preset === 'full') {
      fixConfig = fixes || {
        css: true,
        imports: true,
        react: true,
        stringLiterals: true,
        tailwind: true,
        tsSuggestions: true,
      };
    } else {
      fixConfig = { stringLiterals: true, ...(fixes || {}) };
    }

    // Call the Benchify API
    const startTime = Date.now();
    const resp = await client.fixer.run({
      files: toSend,
      fixes: fixConfig,
      response_format: apply_format,
      ...rest,
    });

    if (resp.error) {
      throw new Error(resp.error.message);
    }

    const data = resp.data ?? {};
    const suggestedChanges = data?.suggested_changes;

    // Handle the union type properly based on response format
    let format = apply_format;
    let changed: any[] = [];
    let diff = '';
    let allFiles: any[] = [];

    if (suggestedChanges) {
      if ('diff' in suggestedChanges) {
        // DiffFormat
        format = 'DIFF';
        diff = suggestedChanges.diff ?? '';
      } else if ('changed_files' in suggestedChanges) {
        // ChangedFilesFormat
        format = 'CHANGED_FILES';
        changed = suggestedChanges.changed_files ?? [];
      } else if ('all_files' in suggestedChanges) {
        // AllFilesFormat
        format = 'ALL_FILES';
        allFiles = suggestedChanges.all_files ?? [];
      }
    }

    // Optionally write to disk
    let applied = false;
    const write_errors: string[] = [];

    if (apply === 'server' && format !== 'DIFF') {
      const filesToWrite = format === 'ALL_FILES' ? allFiles : changed;
      for (const f of filesToWrite) {
        try {
          const abs = path.join(root, f.path);
          await fs.mkdir(path.dirname(abs), { recursive: true });
          await fs.writeFile(abs, f.contents, 'utf8');
        } catch (e: any) {
          write_errors.push(`${f.path}: ${e?.message || e}`);
        }
      }
      applied = write_errors.length === 0;
    }

    const result = {
      summary: {
        files_examined: toSend.length,
        files_changed: changed.length || allFiles.length,
        fixes_enabled: preset === 'full' ? Object.keys(fixConfig) : ['stringLiterals'],
        duration_ms: Date.now() - startTime,
      },
      suggested_changes: {
        format,
        changed_files: changed,
        diff,
        all_files: allFiles,
      },
      applied,
      write_errors,
    };

    return asTextContentResult(await maybeFilter(jq_filter, result));
  } catch (error: any) {
    throw new Error(`Failed to run local fixer: ${error.message}`);
  }
};

export default { metadata, tool, handler };
