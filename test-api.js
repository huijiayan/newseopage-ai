#!/usr/bin/env node
/*
  API Smoke Test Runner

  Usage examples:
  - node test-api.js
  - API_BASE_URL=http://localhost:3000/api/v1 node test-api.js
  - node test-api.js --base https://api.websitelm.com/v1 --token YOUR_JWT --all

  Flags:
  --base, -b        Base URL (default: process.env.API_BASE_URL or https://api.websitelm.com/v1)
  --token, -t       Bearer token for Authorization
  --timeout         Request timeout ms (default: 20000)
  --concurrency, -c Max concurrent requests (default: 5)
  --safeOnly, -s    Only run safe/non-side-effect endpoints (default: true)
  --all, -a         Run all tests (overrides safeOnly)
  --out, -o         Output report JSON path (default: api-test-report.json)
*/

const axios = require('axios');

function parseArgs() {
  const args = process.argv.slice(2);
  const map = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const next = args[i + 1];
    const set = (k, v = true) => (map[k] = v);
    switch (a) {
      case '--base':
      case '-b':
        set('base', next);
        i++;
        break;
      case '--token':
      case '-t':
        set('token', next);
        i++;
        break;
      case '--timeout':
        set('timeout', Number(next));
        i++;
        break;
      case '--concurrency':
      case '-c':
        set('concurrency', Number(next));
        i++;
        break;
      case '--safeOnly':
      case '-s':
        set('safeOnly', true);
        break;
      case '--all':
      case '-a':
        set('all', true);
        break;
      case '--out':
      case '-o':
        set('out', next);
        i++;
        break;
      default:
        // ignore
        break;
    }
  }
  return map;
}

const args = parseArgs();
const BASE_URL = args.base || process.env.API_BASE_URL || 'https://api.websitelm.com/v1';
const AUTH_TOKEN = args.token || process.env.API_TOKEN || process.env.ALTERNATIVELY_ACCESS_TOKEN || '';
const TIMEOUT = Number.isFinite(args.timeout) ? args.timeout : 20000;
const CONCURRENCY = Number.isFinite(args.concurrency) ? args.concurrency : 5;
const SAFE_ONLY = args.all ? false : (args.safeOnly !== undefined ? true : true);
const OUT_PATH = args.out || 'api-test-report.json';

const http = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
});

function authHeaders(requiresAuth) {
  if (!requiresAuth) return {};
  if (!AUTH_TOKEN) return {}; // allow 401 classification
  return { Authorization: `Bearer ${AUTH_TOKEN}` };
}

// Small concurrency limiter
function createLimiter(limit) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= limit || queue.length === 0) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    fn()
      .then((v) => resolve(v))
      .catch((e) => reject(e))
      .finally(() => {
        active--;
        next();
      });
  };
  return (fn) =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
}

// Define tests (grouped, prioritize safe GETs; mark side-effect tests as unsafe)
const tests = [
  // Public/safe GETs
  {
    name: 'GET /features-package',
    method: 'GET',
    path: '/features-package',
    requiresAuth: false,
    safe: true,
    expect: { okStatuses: [200] },
  },
  {
    name: 'GET /pages/view/:slug (nonexistent slug accepted as 404)',
    method: 'GET',
    path: '/pages/view/test-slug-should-not-exist',
    requiresAuth: false,
    safe: true,
    params: { domain: 'example.com', lang: 'en' },
    expect: { okStatuses: [200, 404] },
  },
  {
    name: 'GET /alternatively/website/sitemap?websiteId=invalid',
    method: 'GET',
    path: '/alternatively/website/sitemap',
    requiresAuth: true,
    safe: true,
    params: { websiteId: 'invalid' },
    expect: { okStatuses: [200, 400, 404] }, // endpoint existing check
  },
  {
    name: 'GET /alternatively/results/:websiteId (invalid)',
    method: 'GET',
    path: '/alternatively/results/invalid',
    requiresAuth: true,
    safe: true,
    expect: { okStatuses: [200, 400, 404] },
  },
  {
    name: 'GET /alternatively/:websiteId/status (invalid)',
    method: 'GET',
    path: '/alternatively/invalid/status',
    requiresAuth: true,
    safe: true,
    expect: { okStatuses: [200, 400, 404] },
  },
  {
    name: 'GET /customer/package',
    method: 'GET',
    path: '/customer/package',
    requiresAuth: true,
    safe: true,
    expect: { okStatuses: [200, 401] },
  },
  {
    name: 'GET /customer/info',
    method: 'GET',
    path: '/customer/info',
    requiresAuth: true,
    safe: true,
    expect: { okStatuses: [200, 401] },
  },
  {
    name: 'GET /products/customer',
    method: 'GET',
    path: '/products/customer',
    requiresAuth: true,
    safe: true,
    expect: { okStatuses: [200, 401] },
  },
  {
    name: 'GET /customer/subfolder',
    method: 'GET',
    path: '/customer/subfolder',
    requiresAuth: true,
    safe: true,
    expect: { okStatuses: [200, 401] },
  },
  {
    name: 'GET /domain?customerId=invalid',
    method: 'GET',
    path: '/domain',
    requiresAuth: true,
    safe: true,
    params: { customerId: 'invalid' },
    expect: { okStatuses: [200, 400, 401, 404] },
  },
  {
    name: 'GET /sites (GSC sites)',
    method: 'GET',
    path: '/sites',
    requiresAuth: true,
    safe: true,
    expect: { okStatuses: [200, 401] },
  },
  {
    name: 'GET /sites/analytics (requires params)',
    method: 'GET',
    path: '/sites/analytics',
    requiresAuth: true,
    safe: true,
    params: { startDate: '2024-01-01', endDate: '2024-01-07', dimensions: 'query', queryURL: 'https://example.com' },
    expect: { okStatuses: [200, 400, 401] },
  },

  // Potentially side-effect endpoints (run only with --all)
  {
    name: 'POST /competitor/research',
    method: 'POST',
    path: '/competitor/research',
    requiresAuth: false,
    safe: false,
    headers: { 'api-key': 'difymr1234' },
    data: { website: 'example.com' },
    expect: { okStatuses: [200, 202, 400] },
  },
  {
    name: 'POST /alternatively/generate/websiteId',
    method: 'POST',
    path: '/alternatively/generate/websiteId',
    requiresAuth: true,
    safe: false,
    expect: { okStatuses: [200, 401] },
  },
  {
    name: 'POST /alternatively/search',
    method: 'POST',
    path: '/alternatively/search',
    requiresAuth: true,
    safe: false,
    data: { conversationId: 'conv-smoke', website: 'example.com' },
    expect: { okStatuses: [200, 202, 400, 401] },
  },
];

function classifyFailure(err) {
  if (err.response) {
    const { status, data } = err.response;
    if (status === 401) return { outcome: 'FAIL', reason: 'Unauthorized (missing/invalid token)', status, data };
    if (status === 403) return { outcome: 'FAIL', reason: 'Forbidden (insufficient permissions)', status, data };
    if (status === 404) return { outcome: 'FAIL', reason: 'Not Found (path or method likely incorrect)', status, data };
    if (status === 400) return { outcome: 'FAIL', reason: 'Bad Request (check required params/body)', status, data };
    if (status >= 500) return { outcome: 'FAIL', reason: 'Server Error (backend issue)', status, data };
    return { outcome: 'FAIL', reason: `HTTP ${status}`, status, data };
  }
  if (err.code === 'ECONNABORTED') return { outcome: 'FAIL', reason: 'Timeout', status: 0 };
  if (err.code === 'ENOTFOUND') return { outcome: 'FAIL', reason: 'DNS Not Found', status: 0 };
  return { outcome: 'FAIL', reason: `Network/Unknown error: ${err.message}`, status: 0 };
}

function analyzeResult(t, resOrErr) {
  if (resOrErr && resOrErr.response) {
    // axios error case handled above
    return classifyFailure(resOrErr);
  }
  const res = resOrErr;
  const status = res.status;
  const okStatuses = (t.expect && t.expect.okStatuses) || [200];
  if (okStatuses.includes(status)) {
    // Additional semantic hints
    let note = '';
    if (status === 404 && t.name.includes('nonexistent')) {
      note = 'Endpoint exists (404 for missing slug is acceptable)';
    }
    return { outcome: 'PASS', reason: note || 'OK', status, data: res.data };
  }
  return { outcome: 'FAIL', reason: `Unexpected status ${status}`, status, data: res.data };
}

async function runOneTest(t) {
  if (SAFE_ONLY && !t.safe) {
    return { name: t.name, method: t.method, path: t.path, skipped: true, reason: 'Skipped (safeOnly)' };
  }
  try {
    const headers = { ...authHeaders(t.requiresAuth), ...(t.headers || {}) };
    const config = { headers, params: t.params };
    let res;
    switch (t.method) {
      case 'GET':
        res = await http.get(t.path, config);
        break;
      case 'POST':
        res = await http.post(t.path, t.data || {}, config);
        break;
      case 'PUT':
        res = await http.put(t.path, t.data || {}, config);
        break;
      case 'DELETE':
        res = await http.delete(t.path, config);
        break;
      default:
        throw new Error(`Unsupported method: ${t.method}`);
    }
    const analyzed = analyzeResult(t, res);
    return { name: t.name, method: t.method, path: t.path, ...analyzed };
  } catch (err) {
    const analyzed = classifyFailure(err);
    return { name: t.name, method: t.method, path: t.path, ...analyzed };
  }
}

async function main() {
  console.log(`\n🔎 Running API smoke tests`);
  console.log(`- Base URL: ${BASE_URL}`);
  console.log(`- Auth token provided: ${AUTH_TOKEN ? 'yes' : 'no'}`);
  console.log(`- Safe only: ${SAFE_ONLY}`);
  console.log(`- Concurrency: ${CONCURRENCY}`);
  const limit = createLimiter(CONCURRENCY);

  const results = await Promise.all(
    tests.map((t) => limit(() => runOneTest(t)))
  );

  // Console report
  let pass = 0, fail = 0, skip = 0;
  console.log('\nResults:');
  for (const r of results) {
    if (r.skipped) {
      skip++;
      console.log(`- SKIP ${r.name} [${r.method} ${r.path}] — ${r.reason}`);
      continue;
    }
    if (r.outcome === 'PASS') {
      pass++;
      console.log(`- PASS ${r.name} [${r.method} ${r.path}] — ${r.reason || ''} (status ${r.status})`);
    } else {
      fail++;
      console.log(`- FAIL ${r.name} [${r.method} ${r.path}] — ${r.reason} (status ${r.status})`);
    }
  }
  console.log(`\nSummary: PASS=${pass} FAIL=${fail} SKIP=${skip} TOTAL=${results.length}`);

  // Persist JSON report (without full data payload to keep file small)
  const slim = results.map(({ data, ...rest }) => rest);
  try {
    const fs = require('fs');
    fs.writeFileSync(OUT_PATH, JSON.stringify(slim, null, 2), 'utf8');
    console.log(`\n📝 Report saved to ${OUT_PATH}`);
  } catch (e) {
    console.warn('Failed to write report file:', e.message);
  }
}

main().catch((e) => {
  console.error('Unexpected runner error:', e);
  process.exit(1);
});


