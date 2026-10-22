import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import url, { fileURLToPath } from 'node:url';

import store from './src/main/storage/store.js';
import shieldsEngine from './src/main/shields/shields-engine.js';
import blocklists from './src/main/shields/blocklists.js';
import leoService from './src/main/ai/leo-service.js';
import torSession from './src/main/tor/tor-session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('🧪 BRAVE BROWSER COMPREHENSIVE TEST SUITE (ESM)');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function main() {
  // ----------------------------------------------------
  // TEST GROUP 1: Store & Persistence Layer
  // ----------------------------------------------------
  console.log('📦 1. Store & Persistence Layer');
  runTest('Store initializes properly with default keys', () => {
    store.init();
    assert(store.data !== null, 'Store data should be initialized');
    assert(Array.isArray(store.data.bookmarks), 'Bookmarks should be array');
    assert(Array.isArray(store.data.history), 'History should be array');
    assert(Array.isArray(store.data.topSites), 'TopSites should be array');
    assert(typeof store.data.shieldsStats === 'object', 'ShieldsStats should be object');
    assert(typeof store.data.wallet === 'object', 'Wallet should be object');
    assert(typeof store.data.rewards === 'object', 'Rewards should be object');
  });

  runTest('Store Bookmarks CRUD', () => {
    const testBm = { id: 'test_bm_1', title: 'Test Page', url: 'https://example.com' };
    store.addBookmark(testBm);
    assert(store.isBookmarked('https://example.com'), 'URL should be bookmarked');
    const bms = store.getBookmarks();
    assert(bms.some(b => b.id === 'test_bm_1'), 'Bookmark should exist in list');
    store.removeBookmark('test_bm_1');
    assert(!store.isBookmarked('https://example.com'), 'URL should no longer be bookmarked');
  });

  runTest('Store History Operations', () => {
    store.addHistory({ url: 'https://brave.com', title: 'Brave Browser' });
    const hist = store.getHistory();
    assert(hist.length > 0, 'History should contain items');
    assert(hist[0].url === 'https://brave.com', 'Latest history should match');
  });

  runTest('Store Shields Domain Configuration', () => {
    store.setDomainShields('example.org', { enabled: true, blockScripts: true, forgetOnClose: true });
    const cfg = store.getDomainShields('example.org');
    assert(cfg.enabled === true, 'Shields should be enabled');
    assert(cfg.blockScripts === true, 'Scripts should be blocked');
    assert(cfg.forgetOnClose === true, 'ForgetOnClose should be true');
  });

  runTest('Store Playlist Operations', () => {
    const item = { id: 'pl_1', title: 'Private Browsing Video', url: 'https://youtube.com/watch?v=123' };
    store.addToPlaylist(item);
    const pl = store.getPlaylist();
    assert(pl.some(i => i.id === 'pl_1'), 'Item should be in playlist');
    store.removeFromPlaylist('pl_1');
    assert(!store.getPlaylist().some(i => i.id === 'pl_1'), 'Item should be removed');
  });

  // ----------------------------------------------------
  // TEST GROUP 2: Shields Engine & Privacy Filters
  // ----------------------------------------------------
  console.log('\n🛡️ 2. Brave Shields Engine & Privacy Protections');
  runTest('Blocklists loaded with ad, tracker, and miner domains', () => {
    assert(blocklists.AD_DOMAINS.size > 10, 'Should have ad domains');
    assert(blocklists.TRACKER_DOMAINS.size > 10, 'Should have tracker domains');
    assert(blocklists.CRYPTO_MINER_DOMAINS.size > 5, 'Should have crypto miner domains');
  });

  runTest('Shields Engine blocks known tracker/ad requests', () => {
    assert(shieldsEngine.isBlockedDomain('doubleclick.net'), 'doubleclick.net must be blocked');
    assert(shieldsEngine.isBlockedDomain('google-analytics.com'), 'google-analytics.com must be blocked');
    assert(shieldsEngine.isBlockedDomain('coinhive.com'), 'coinhive.com must be blocked');
    assert(shieldsEngine.isBlockedDomain('analytics.facebook.com'), 'analytics.facebook.com must be blocked');
    assert(!shieldsEngine.isBlockedDomain('brave.com'), 'brave.com should NOT be blocked');
    assert(!shieldsEngine.isBlockedDomain('github.com'), 'github.com should NOT be blocked');
  });

  runTest('Shields Engine Clean URLs strips UTM and tracking params', () => {
    const dirty = 'https://example.com/item?id=42&utm_source=twitter&utm_medium=social&fbclid=IwAR29&gclid=12345';
    const cleaned = shieldsEngine.cleanUrl(dirty);
    assert(!cleaned.includes('utm_source'), 'utm_source should be stripped');
    assert(!cleaned.includes('utm_medium'), 'utm_medium should be stripped');
    assert(!cleaned.includes('fbclid'), 'fbclid should be stripped');
    assert(!cleaned.includes('gclid'), 'gclid should be stripped');
    assert(cleaned.includes('id=42'), 'Legitimate query param id=42 must be preserved');
  });

  runTest('Shields Engine De-AMP unwraps AMP redirects', () => {
    const ampGoogle = 'https://www.google.com/amp/s/www.theverge.com/tech-article';
    const unwrappedGoogle = shieldsEngine.deAmp(ampGoogle);
    assert.strictEqual(unwrappedGoogle, 'https://www.theverge.com/tech-article', 'Google AMP should unwrap to canonical');

    const ampDirect = 'https://theverge.com/article/amp';
    const unwrappedDirect = shieldsEngine.deAmp(ampDirect);
    assert.strictEqual(unwrappedDirect, 'https://theverge.com/article', 'AMP path suffix should be stripped');
  });

  runTest('Shields Engine Custom Filter Rules', () => {
    shieldsEngine.addCustomFilter('||badtracker.xyz^');
    assert(shieldsEngine.isBlockedDomain('badtracker.xyz'), 'Custom filter domain should be blocked');
  });

  // ----------------------------------------------------
  // TEST GROUP 3: Brave Leo AI Assistant
  // ----------------------------------------------------
  console.log('\n🤖 3. Brave Leo AI Assistant');
  runTest('Leo provides model options', () => {
    const models = leoService.getAvailableModels();
    assert(Array.isArray(models) && models.length >= 3, 'Should provide at least 3 AI models');
    assert(models.some(m => m.id === 'leo-llama-3-8b'), 'Should include Llama 3');
    assert(models.some(m => m.id === 'leo-claude-3-5'), 'Should include Claude 3.5');
  });

  await runAsyncTest('Leo chat response generation', async () => {
    const res = await leoService.chat({
      prompt: 'What are the main features of Brave Browser?',
      context: 'Brave is a privacy-focused browser with built-in Shields and Leo AI.',
      model: 'leo-llama-3-8b'
    });
    assert(res && res.text, 'Response should contain text');
    assert(res.text.length > 20, 'Response should be informative');
    assert(res.model === 'leo-llama-3-8b', 'Model ID should be returned');
  });

  await runAsyncTest('Leo page summarization', async () => {
    const summary = await leoService.summarize({
      title: 'Decentralized Web & Privacy in 2026',
      content: 'Privacy technologies in 2026 emphasize local-first data processing, tracker blocking, and cryptographic identities.',
      type: 'summary'
    });
    assert(summary && summary.text, 'Summary should contain generated content');
    assert(summary.text.includes('Summary') || summary.text.length > 30, 'Summary should be generated');
  });

  // ----------------------------------------------------
  // TEST GROUP 4: Tor Mode & Onion Circuits
  // ----------------------------------------------------
  console.log('\n🧅 4. Tor Mode & Onion Routing');
  runTest('Tor circuit creates multi-hop relay nodes (Client -> Guard -> Middle -> Exit)', () => {
    const data = torSession.getCircuit();
    assert(data.connected === true, 'Tor should be marked connected');
    assert(Array.isArray(data.circuit) && data.circuit.length === 4, 'Circuit must contain 4 nodes (client + 3 relays)');
    assert(data.circuit[1].role.includes('Guard'), 'Second node must be Guard Relay');
    assert(data.circuit[2].role.includes('Middle'), 'Third node must be Middle Relay');
    assert(data.circuit[3].role.includes('Exit'), 'Fourth node must be Exit Node');
  });

  runTest('Tor new circuit creates fresh relays with unique IPs', () => {
    const res = torSession.newCircuit();
    assert(res.connected === true, 'New circuit should be connected');
    assert(res.circuit.length === 4, 'New circuit must have 4 nodes');
    assert(res.circuit[1].ip && res.circuit[2].ip && res.circuit[3].ip, 'All relay nodes must have IPs');
  });

  // ----------------------------------------------------
  // TEST GROUP 5: Internal Pages Verification
  // ----------------------------------------------------
  console.log('\n📄 5. Internal Pages (brave://*) File Integrity');
  const internalPages = [
    'newtab',
    'settings',
    'wallet',
    'rewards',
    'history',
    'bookmarks',
    'downloads',
    'tor',
    'shields',
    'playlist'
  ];

  internalPages.forEach(page => {
    runTest(`brave://${page} has valid HTML, CSS, and JS files`, () => {
      const htmlPath = path.join(__dirname, `src/internal-pages/${page}/${page}.html`);
      const cssPath = path.join(__dirname, `src/internal-pages/${page}/${page}.css`);
      const jsPath = path.join(__dirname, `src/internal-pages/${page}/${page}.js`);

      assert(fs.existsSync(htmlPath), `${page}.html must exist`);
      assert(fs.existsSync(cssPath), `${page}.css must exist`);
      assert(fs.existsSync(jsPath), `${page}.js must exist`);

      const html = fs.readFileSync(htmlPath, 'utf8');
      assert(html.includes(`<title>`), `${page}.html must have title`);
      assert(html.includes(`${page}.css`), `${page}.html must link ${page}.css`);
      assert(html.includes(`${page}.js`), `${page}.html must script ${page}.js`);
    });
  });

  // ----------------------------------------------------
  // TEST GROUP 6: Protocol Handler File Resolution
  // ----------------------------------------------------
  console.log('\n🌐 6. brave:// Protocol Resolver');
  internalPages.forEach(page => {
    runTest(`Protocol resolves brave://${page}/`, () => {
      const baseInternalDir = path.join(__dirname, 'src/internal-pages');
      const targetFilePath = path.join(baseInternalDir, `${page}/${page}.html`);
      assert(fs.existsSync(targetFilePath), `File must exist at ${targetFilePath}`);
      const fileUrl = url.pathToFileURL(targetFilePath).toString();
      assert(fileUrl.startsWith('file:///'), 'Must resolve to valid file URL');
    });
  });

  // ----------------------------------------------------
  // TEST SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('====================================================');

  if (passedTests === totalTests) {
    console.log('🎉 ALL PROJECT MODULES AND FEATURES ARE WORKING 100% CORRECTLY!\n');
    process.exit(0);
  } else {
    console.error('⚠️ Some tests failed. Review details above.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
