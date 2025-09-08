import React, { useEffect, useMemo, useRef } from 'react';

export type BundleFile = {
  path: string; // e.g., "index.html", "assets/chunk-XYZ.js"
  contents: string | Uint8Array | ArrayBuffer;
  contentType?: string; // optional; guessed by extension if omitted
};

type Props = {
  files: BundleFile[]; // your {path, contents} bundle
  className?: string;
  sandbox?: string; // default: "allow-scripts allow-same-origin"
  title?: string;
};

/**
 * ViteBundleIframe
 * Renders a bundled Vite build (provided as {path, contents}[]) inside an iframe.
 * No server routes required. Works by:
 *  - generating blob: URLs for all files
 *  - building an import map for ESM + dynamic chunks
 *  - rewriting index.html + CSS + JS to point at the blob URLs
 *  - setting iframe.srcdoc to the rewritten index
 */
export function BundleRenderer({
  files,
  className = 'w-full h-full',
  sandbox = 'allow-scripts allow-same-origin',
  title = 'vite-bundle-iframe',
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Normalize and index files by clean path
  const normalized = useMemo(() => {
    const index: Record<string, BundleFile> = {};
    for (const f of files) {
      const p = cleanPath(f.path);
      index[p] = { ...f, path: p };
    }
    return index;
  }, [files]);

  useEffect(() => {
    let revoked = false;
    const objectURLs: string[] = [];

    // 1) Create blob URLs for every file (with optional pre-rewrites for CSS/JS)
    // We'll do two passes:
    //   - Pass A: build map of raw blob URLs for all assets (so we can rewrite references)
    //   - Pass B: generate rewritten CSS/JS blobs using those URLs (and replace in the map)
    const rawBlobUrlByPath = new Map<string, string>();
    const typeByPath = new Map<string, string>();

    for (const p in normalized) {
      const f = normalized[p];
      if (!f) continue;
      const mime = f.contentType ?? guessType(p);
      typeByPath.set(p, mime);
      const data = toUint8(f.contents);
      const url = URL.createObjectURL(new Blob([data], { type: mime }));
      objectURLs.push(url);
      rawBlobUrlByPath.set(p, url);
    }

    // 2) Build a best-effort import map for all JS modules (incl. relative keys)
    const importMap: Record<string, string> = {};
    for (const [p, url] of rawBlobUrlByPath.entries()) {
      if (typeByPath.get(p)?.startsWith('text/javascript')) {
        // Map by exact path and with "./" prefix (helps relative specifiers)
        importMap[p] = url;
        importMap['./' + p] = url;
        // Also map without "assets/" when chunks are referenced like "./chunk-XYZ.js"
        if (p.startsWith('assets/')) {
          importMap['./' + p.replace(/^assets\//, '')] = url;
          importMap[p.replace(/^assets\//, '')] = url;
        }
      }
    }

    // 3) Rewrite CSS url(...) to blob URLs
    const cssBlobUrlByPath = new Map<string, string>();
    for (const [p, baseUrl] of rawBlobUrlByPath.entries()) {
      if (!/\.css$/i.test(p)) continue;
      const file = normalized[p];
      if (!file) continue;
      const original = getText(file.contents);
      const rewritten = rewriteCssUrls(original, (rel) => {
        const target = resolveLikeVite(p, rel);
        const hit = rawBlobUrlByPath.get(target);
        return hit ?? rel; // if unknown, leave as-is
      });
      const url = URL.createObjectURL(new Blob([rewritten], { type: 'text/css' }));
      objectURLs.push(url);
      cssBlobUrlByPath.set(p, url);
    }
    // overlay CSS urls in map
    for (const [p, url] of cssBlobUrlByPath.entries()) {
      rawBlobUrlByPath.set(p, url);
    }

    // 4) Rewrite common JS patterns:
    //    - new URL("path", import.meta.url) -> blob URL
    //    - new Worker("path", ...) / new Worker(new URL("path", import.meta.url), ...)
    //    - WebAssembly.compile/instantiateStreaming paths (via new URL(...))
    const jsBlobUrlByPath = new Map<string, string>();
    for (const [p, baseUrl] of rawBlobUrlByPath.entries()) {
      if (!/\.m?js$/.test(p)) continue;
      const file = normalized[p];
      if (!file) continue;
      const original = getText(file.contents);
      const rewritten = rewriteJsUrls(original, (rel) => {
        const target = resolveLikeVite(p, rel);
        const hit = rawBlobUrlByPath.get(target);
        return hit ?? rel;
      });
      const url = URL.createObjectURL(new Blob([rewritten], { type: 'text/javascript' }));
      objectURLs.push(url);
      jsBlobUrlByPath.set(p, url);

      // Update import map to rewritten JS (so dynamic import() loads the right one)
      importMap[p] = url;
      importMap['./' + p] = url;
      if (p.startsWith('assets/')) {
        importMap[p.replace(/^assets\//, '')] = url;
        importMap['./' + p.replace(/^assets\//, '')] = url;
      }
    }
    for (const [p, url] of jsBlobUrlByPath.entries()) {
      rawBlobUrlByPath.set(p, url);
    }

    // 5) Prepare index.html (or first *.html) and rewrite its tags (script/link/modulepreload)
    const indexHtmlPath =
      Object.keys(normalized).find((p) => /(^|\/)index\.html$/i.test(p)) ||
      Object.keys(normalized).find((p) => /\.html$/i.test(p));

    if (!indexHtmlPath) {
      console.error('[ViteBundleIframe] No index.html found in bundle');
      return () => {};
    }

    const indexFile = normalized[indexHtmlPath];
    if (!indexFile) {
      console.error('[ViteBundleIframe] Index HTML file not found in normalized bundle');
      return () => {};
    }

    let html = getText(indexFile.contents);

    // Inject <base> so relative links resolve predictably (for things we can't catch)
    html = ensureBaseTag(html);

    // Fix viewport units in iframe context (vh/vw don't work properly in iframes)
    const viewportFix = `<style>
            /* Fix for h-screen/100vh in iframe context - ensure full height chain */
            html { height: 100%; width: 100%; }
            body { height: 100%; width: 100%; margin: 0; padding: 0; }
            #root { height: 100%; width: 100%; }
            /* Backup selectors for common app root patterns */
            #app { height: 100%; width: 100%; }
            [id*="root"] { height: 100%; width: 100%; }
            body > div:first-child { height: 100%; width: 100%; }
            
            /* Fix Tailwind's viewport classes to use 100% instead of viewport units in iframe */
            .h-screen { height: 100% !important; }
            .w-screen { width: 100% !important; }
            
            /* Fix other common viewport units that don't work in iframes */
            .min-h-screen { min-height: 100% !important; }
            .max-h-screen { max-height: 100% !important; }
            .min-w-screen { min-width: 100% !important; }
            .max-w-screen { max-width: 100% !important; }
            
            /* Ensure full width for common container patterns */
            .max-w-full { max-width: 100% !important; }
            .w-full { width: 100% !important; }
        </style>`;
    html = injectIntoHead(html, viewportFix);

    // Inject the import map
    const importMapScript = `<script type="importmap">${JSON.stringify({
      imports: importMap,
    })}</script>`;
    html = injectBeforeFirstModuleScript(html, importMapScript);

    // Rewrite common tags to blob URLs
    html = rewriteHtmlSrcHrefs(html, (rel) => {
      // Keep absolute http(s) untouched
      if (/^(https?:)?\/\//i.test(rel)) return rel;
      const target = resolveLikeVite(indexHtmlPath!, rel);
      return rawBlobUrlByPath.get(target) ?? rel;
    });

    // 6) Set iframe.srcdoc and cleanup on unmount
    const iframe = iframeRef.current;
    if (iframe) {
      const indexUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      objectURLs.push(indexUrl);
      iframe.srcdoc = html; // srcdoc works better with import maps than blob URL in some browsers
      // Fallback: iframe.src = indexUrl;  // uncomment if you prefer src over srcdoc
    }

    return () => {
      if (revoked) return;
      revoked = true;
      for (const u of objectURLs) {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      }
    };
  }, [normalized]);

  return (
    <iframe
      ref={iframeRef}
      className={className}
      sandbox={sandbox}
      title={title}
      style={{ border: 'none', display: 'block' }}
    />
  );
}

/* ---------------- helpers ---------------- */

function cleanPath(p: string) {
  return p.replace(/^\/+/, '');
}

function toUint8(x: string | Uint8Array | ArrayBuffer) {
  if (typeof x === 'string') return new TextEncoder().encode(x);
  if (x instanceof Uint8Array) return x;
  return new Uint8Array(x);
}

function getText(x: string | Uint8Array | ArrayBuffer) {
  if (typeof x === 'string') return x;
  const u8 = x instanceof Uint8Array ? x : new Uint8Array(x);
  return new TextDecoder().decode(u8);
}

function guessType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'html':
      return 'text/html';
    case 'js':
    case 'mjs':
      return 'text/javascript';
    case 'css':
      return 'text/css';
    case 'map':
    case 'json':
      return 'application/json';
    case 'wasm':
      return 'application/wasm';
    case 'svg':
      return 'image/svg+xml';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'ico':
      return 'image/x-icon';
    case 'ttf':
      return 'font/ttf';
    case 'otf':
      return 'font/otf';
    case 'woff':
      return 'font/woff';
    case 'woff2':
      return 'font/woff2';
    default:
      return 'application/octet-stream';
  }
}

// Resolve rel like Vite output (relative to file's folder)
function resolveLikeVite(fromPath: string, rel: string): string {
  if (/^(https?:)?\/\//i.test(rel)) return rel; // absolute URL
  if (rel.startsWith('blob:') || rel.startsWith('data:')) return rel;

  const fromDir = fromPath.replace(/[^/]+$/, '');
  const stack = (fromDir + rel).split('/');
  const out: string[] = [];
  for (const seg of stack) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') out.pop();
    else out.push(seg);
  }
  return out.join('/');
}

function rewriteCssUrls(css: string, mapUrl: (rel: string) => string): string {
  // basic url(...) parser; handles quotes and no-quotes
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (_m, _q, rel) => {
    const mapped = mapUrl(rel);
    return `url(${JSON.stringify(mapped)})`;
  });
}

function rewriteJsUrls(js: string, mapUrl: (rel: string) => string): string {
  let out = js;

  // new URL("path", import.meta.url) → "blob:..."
  out = out.replace(/new\s+URL\s*\(\s*(['"])([^'"]+)\1\s*,\s*import\.meta\.url\s*\)/g, (_m, _q, rel) =>
    JSON.stringify(mapUrl(rel)),
  );

  // new Worker("path", ...) → new Worker("blob:...")
  out = out.replace(
    /new\s+Worker\s*\(\s*(['"])([^'"]+)\1\s*(,|\))/g,
    (_m, _q, rel, tail) => `new Worker(${JSON.stringify(mapUrl(rel))}${tail}`,
  );

  // new Worker(new URL("path", import.meta.url), ...) → new Worker("blob:...", ...)
  out = out.replace(
    /new\s+Worker\s*\(\s*new\s+URL\s*\(\s*(['"])([^'"]+)\1\s*,\s*import\.meta\.url\s*\)\s*(,|\))/g,
    (_m, _q, rel, tail) => `new Worker(${JSON.stringify(mapUrl(rel))}${tail}`,
  );

  // WebAssembly.*(fetch(new URL("path", import.meta.url))) → replace inner URL
  out = out.replace(/new\s+URL\s*\(\s*(['"])([^'"]+)\1\s*,\s*import\.meta\.url\s*\)/g, (_m, _q, rel) =>
    JSON.stringify(mapUrl(rel)),
  );

  return out;
}

function ensureBaseTag(html: string): string {
  // If there's no <base>, add one with a same-origin virtual path
  if (/<base\s/i.test(html)) return html;
  const base = `<base href="/virtual/">`;
  if (/<head[\s>]/i.test(html)) {
    return html.replace(/<head([\s>])/i, `<head$1${base}`);
  }
  // Otherwise inject a head
  return `<!doctype html><head>${base}</head>${html}`;
}

function injectIntoHead(html: string, snippet: string): string {
  if (/<head[\s>]/i.test(html)) {
    return html.replace(/<head([\s>])/i, `<head$1${snippet}`);
  }
  // If no head tag, inject one
  return `<!doctype html><head>${snippet}</head>${html}`;
}

function injectBeforeFirstModuleScript(html: string, snippet: string): string {
  const idx = html.search(/<script[^>]*type=["']module["'][^>]*>/i);
  if (idx === -1) {
    // no module script; just inject in head
    return injectIntoHead(html, snippet);
  }
  return html.slice(0, idx) + snippet + html.slice(idx);
}

function rewriteHtmlSrcHrefs(html: string, mapUrl: (rel: string) => string): string {
  // <script src="...">, <link href="...">, <img src="...">, modulepreload
  return html
    .replace(/(<script\b[^>]*\bsrc=)(['"])([^'"]+)\2/gi, (_m, pre, q, rel) => `${pre}${q}${mapUrl(rel)}${q}`)
    .replace(/(<link\b[^>]*\bhref=)(['"])([^'"]+)\2/gi, (_m, pre, q, rel) => `${pre}${q}${mapUrl(rel)}${q}`)
    .replace(/(<img\b[^>]*\bsrc=)(['"])([^'"]+)\2/gi, (_m, pre, q, rel) => `${pre}${q}${mapUrl(rel)}${q}`);
}
