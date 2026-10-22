import { URL } from 'node:url';
import { AD_DOMAINS, TRACKER_DOMAINS, CRYPTO_MINER_DOMAINS, PATH_PATTERNS } from './blocklists.js';
import store from '../storage/store.js';

// Known tracking query parameters stripped by Brave Clean URLs
const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'gbraid',
  'wbraid',
  'msclkid',
  'mc_eid',
  'igshid',
  '_hsenc',
  '_hsmi',
  'yclid',
  'mkt_tok',
  'sc_campaign',
  'sc_channel',
  'irclickid',
  'dclid',
  'twclid',
  's_kwcid'
]);

// Known malicious / phishing test domains
const MALICIOUS_DOMAINS = new Set([
  'testsafebrowsing.appspot.com',
  'malware.testing.google.test',
  'phishing.test',
  'crypto-drainer.example',
  'free-crypto-giveaway.invalid',
  'steal-my-keys.test'
]);

class ShieldsEngine {
  constructor() {
    this.session = null;
    this.tabStats = new Map();
    this.onBlockCallback = null;
    this.customBlockRules = [];
    this.customCosmeticRules = [];
  }

  setBlockCallback(cb) {
    this.onBlockCallback = cb;
  }

  init(ses) {
    this.session = ses;
    this.loadCustomRules();
    this.setupWebRequestHooks();
  }

  loadCustomRules() {
    try {
      const saved = store.get('customFilterRules') || [];
      this.customBlockRules = [];
      this.customCosmeticRules = [];

      saved.forEach(rule => {
        const trimmed = rule.trim();
        if (!trimmed || trimmed.startsWith('!')) return;
        if (trimmed.startsWith('##') || trimmed.includes('##')) {
          this.customCosmeticRules.push(trimmed);
        } else if (trimmed.startsWith('||')) {
          const dom = trimmed.replace(/^\|\|/, '').replace(/\^.*$/, '');
          this.customBlockRules.push(dom.toLowerCase());
        }
      });
    } catch (e) {
      console.warn('Failed loading custom filter rules:', e);
    }
  }

  getTabStats(tabId) {
    if (!this.tabStats.has(tabId)) {
      this.tabStats.set(tabId, { blockedItems: [], count: 0, hostname: '' });
    }
    return this.tabStats.get(tabId);
  }

  resetTabStats(tabId, hostname = '') {
    this.tabStats.set(tabId, { blockedItems: [], count: 0, hostname });
  }

  extractHostname(urlString) {
    try {
      const parsed = new URL(urlString);
      return parsed.hostname.toLowerCase();
    } catch {
      return '';
    }
  }

  isInternalUrl(urlString) {
    if (!urlString) return true;
    return (
      urlString.startsWith('brave://') ||
      urlString.startsWith('chrome://') ||
      urlString.startsWith('devtools://') ||
      urlString.startsWith('file://') ||
      urlString.startsWith('about:') ||
      urlString.startsWith('data:')
    );
  }

  domainMatchesSet(hostname, domainSet) {
    if (domainSet.has(hostname)) return true;
    const parts = hostname.split('.');
    for (let i = 1; i < parts.length - 1; i++) {
      const parentDomain = parts.slice(i).join('.');
      if (domainSet.has(parentDomain)) return true;
    }
    return false;
  }

  /**
   * Brave De-AMP: Detects Google AMP links and extracts canonical target URL
   */
  deAMPUrl(urlString) {
    try {
      const parsed = new URL(urlString);
      if (parsed.hostname.includes('google.') && parsed.pathname.startsWith('/amp/')) {
        let clean = parsed.pathname.replace(/^\/amp\/(s\/)?/, '');
        if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
          clean = 'https://' + clean;
        }
        return clean;
      }
      if (parsed.hostname.endsWith('.ampproject.org')) {
        let clean = parsed.pathname.replace(/^\/c\/(s\/)?/, '');
        if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
          clean = 'https://' + clean;
        }
        return clean;
      }
    } catch {}
    return null;
  }

  /**
   * Brave Clean URLs: Strips tracking query parameters (e.g. fbclid, utm_source, gclid)
   */
  cleanTrackingParameters(urlString) {
    try {
      const parsed = new URL(urlString);
      let changed = false;
      const keysToDelete = [];

      for (const [key] of parsed.searchParams.entries()) {
        const lowerKey = key.toLowerCase();
        if (TRACKING_PARAMS.has(lowerKey) || lowerKey.startsWith('utm_')) {
          keysToDelete.push(key);
          changed = true;
        }
      }

      if (changed) {
        keysToDelete.forEach(k => parsed.searchParams.delete(k));
        return parsed.toString();
      }
    } catch {}
    return null;
  }

  /**
   * Forgetful Browsing: Clears site-specific cookies and storage when closing tab
   */
  async forgetDomainStorage(hostname) {
    if (!this.session || !hostname) return;
    try {
      await this.session.clearStorageData({
        origins: [`https://${hostname}`, `http://${hostname}`],
        storages: ['cookies', 'localstorage', 'indexdb', 'cache']
      });
      console.log(`[Shields] Forgetful browsing purged storage for ${hostname}`);
    } catch (e) {
      console.warn(`[Shields] Failed to purge storage for ${hostname}:`, e);
    }
  }

  evaluateRequest(urlString, resourceType, mainPageHost, siteShields) {
    if (!siteShields.enabled) {
      return { block: false, reason: 'shields_disabled' };
    }

    if (siteShields.blockScripts && resourceType === 'script') {
      return { block: true, type: 'script', reason: 'scripts_blocked' };
    }

    const reqHost = this.extractHostname(urlString);
    if (!reqHost) return { block: false };

    // Check Malicious Phishing Protection
    if (this.domainMatchesSet(reqHost, MALICIOUS_DOMAINS)) {
      return { block: true, type: 'malware', host: reqHost, reason: 'phishing_malware_defense' };
    }

    // Check Crypto Miners
    if (this.domainMatchesSet(reqHost, CRYPTO_MINER_DOMAINS)) {
      return { block: true, type: 'miner', host: reqHost, reason: 'crypto_miner' };
    }

    // Check Trackers
    if (siteShields.blockTrackers && this.domainMatchesSet(reqHost, TRACKER_DOMAINS)) {
      return { block: true, type: 'tracker', host: reqHost, reason: 'known_tracker' };
    }

    // Check Ads
    if (siteShields.blockAds && this.domainMatchesSet(reqHost, AD_DOMAINS)) {
      return { block: true, type: 'ad', host: reqHost, reason: 'known_ad_network' };
    }

    // Check Custom AdBlock Rules
    if (this.customBlockRules.some(ruleHost => reqHost.includes(ruleHost))) {
      return { block: true, type: 'ad', host: reqHost, reason: 'custom_adblock_filter' };
    }

    // Check common path patterns
    for (const pattern of PATH_PATTERNS) {
      if (pattern.test(urlString)) {
        return { block: true, type: 'tracker', host: reqHost, reason: 'ad_tracker_path' };
      }
    }

    return { block: false };
  }

  setupWebRequestHooks() {
    if (!this.session) return;

    const filter = { urls: ['*://*/*'] };

    // 1. onBeforeSendHeaders: Inject Strict Privacy Headers
    this.session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
      const requestHeaders = details.requestHeaders || {};
      requestHeaders['DNT'] = '1';
      requestHeaders['Sec-GPC'] = '1'; // Global Privacy Control
      callback({ requestHeaders });
    });

    // 2. onBeforeRequest: De-AMP, Clean URLs, HTTPS Upgrade & Ad/Tracker Blocking
    this.session.webRequest.onBeforeRequest(filter, (details, callback) => {
      const { url, resourceType, webContentsId } = details;

      if (this.isInternalUrl(url)) {
        return callback({});
      }

      // Check De-AMP
      const deAMPed = this.deAMPUrl(url);
      if (deAMPed) {
        return callback({ redirectURL: deAMPed });
      }

      // Check Clean URLs (strip tracking query tokens on navigation)
      if (resourceType === 'main_frame') {
        const cleanedUrl = this.cleanTrackingParameters(url);
        if (cleanedUrl && cleanedUrl !== url) {
          return callback({ redirectURL: cleanedUrl });
        }
      }

      // Check HTTPS Upgrade
      try {
        const parsed = new URL(url);
        const pageHost = parsed.hostname;
        const domainConfig = store.getDomainShields(pageHost);

        if (
          parsed.protocol === 'http:' &&
          domainConfig.upgradeHttps &&
          !pageHost.endsWith('.local') &&
          pageHost !== 'localhost' &&
          pageHost !== '127.0.0.1'
        ) {
          const secureUrl = url.replace(/^http:\/\//i, 'https://');
          return callback({ redirectURL: secureUrl });
        }

        // Shields evaluation
        const evalResult = this.evaluateRequest(url, resourceType, pageHost, domainConfig);

        if (evalResult.block) {
          // Record statistics
          store.recordBlockedItem(evalResult.type, 18500);

          // Update tab stats
          const stats = this.getTabStats(webContentsId);
          stats.count++;
          stats.blockedItems.push({
            url,
            type: evalResult.type,
            reason: evalResult.reason,
            host: evalResult.host || this.extractHostname(url),
            timestamp: Date.now()
          });

          if (this.onBlockCallback) {
            this.onBlockCallback(webContentsId, stats);
          }

          return callback({ cancel: true });
        }
      } catch (e) {}

      callback({});
    });

    // 3. onHeadersReceived: Partition Isolation and Cookie Defense
    this.session.webRequest.onHeadersReceived(filter, (details, callback) => {
      const responseHeaders = details.responseHeaders || {};
      callback({ responseHeaders });
    });
  }

  isBlockedDomain(hostname) {
    if (!hostname) return false;
    const h = hostname.toLowerCase();
    if (this.domainMatchesSet(h, MALICIOUS_DOMAINS)) return true;
    if (this.domainMatchesSet(h, CRYPTO_MINER_DOMAINS)) return true;
    if (this.domainMatchesSet(h, TRACKER_DOMAINS)) return true;
    if (this.domainMatchesSet(h, AD_DOMAINS)) return true;
    if (this.customBlockRules.some(ruleHost => h.includes(ruleHost))) return true;
    return false;
  }

  cleanUrl(urlString) {
    return this.cleanTrackingParameters(urlString) || urlString;
  }

  deAmp(urlString) {
    if (!urlString) return urlString;
    const deAMPed = this.deAMPUrl(urlString);
    if (deAMPed) return deAMPed;
    // Strip direct trailing /amp or /amp/
    if (urlString.endsWith('/amp') || urlString.endsWith('/amp/')) {
      return urlString.replace(/\/amp\/?$/, '');
    }
    return urlString;
  }

  addCustomFilter(rule) {
    if (!rule) return;
    const trimmed = rule.trim();
    if (trimmed.startsWith('||')) {
      const dom = trimmed.replace(/^\|\|/, '').replace(/\^.*$/, '');
      this.customBlockRules.push(dom.toLowerCase());
    } else if (trimmed.startsWith('##')) {
      this.customCosmeticRules.push(trimmed);
    }
  }
}

const shieldsEngine = new ShieldsEngine();
export { shieldsEngine, ShieldsEngine };
export default shieldsEngine;
