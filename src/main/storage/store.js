import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import electron from 'electron';

const app = (typeof electron === 'object' && electron) ? electron.app : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataStore {
  constructor() {
    this.storagePath = null;
    this.data = this.getDefaults();
    this.isInitialized = false;
  }

  init() {
    try {
      const userDataDir = app ? app.getPath('userData') : path.join(__dirname, '../../../.data');
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      this.storagePath = path.join(userDataDir, 'brave-browser-data.json');
      this.load();
      this.isInitialized = true;
    } catch (err) {
      console.error('[DataStore] Failed to initialize storage:', err);
    }
  }

  getDefaults() {
    return {
      settings: {
        appearance: {
          theme: 'dark', // 'dark' | 'light' | 'midnight'
          accentColor: '#FF7626', // Brave Orange
          tabLayout: 'horizontal', // 'horizontal' | 'vertical'
          showBookmarksBar: true,
          showShieldsBadge: true
        },
        shields: {
          globalEnabled: true,
          blockAds: true,
          blockTrackers: true,
          fingerprintingProtection: 'standard', // 'standard' | 'aggressive' | 'off'
          upgradeHttps: true,
          blockThirdPartyCookies: true,
          blockScripts: false
        },
        search: {
          defaultEngine: 'brave',
          engines: {
            brave: 'https://search.brave.com/search?q=%s',
            duckduckgo: 'https://duckduckgo.com/?q=%s',
            google: 'https://www.google.com/search?q=%s',
            startpage: 'https://www.startpage.com/sp/search?query=%s',
            ecosia: 'https://www.ecosia.org/search?q=%s'
          }
        },
        privacy: {
          doNotTrack: true,
          webrtcPolicy: 'disable_non_proxied_udp',
          clearOnExit: false
        },
        leo: {
          defaultModel: 'leo-llama-3-8b',
          customApiKey: '',
          autoSummarize: false
        }
      },
      shieldsStats: {
        totalAdsBlocked: 1420,
        totalTrackersBlocked: 865,
        totalBandwidthSavedBytes: 29500000, // ~29.5 MB
        totalTimeSavedMs: 45000 // 45 seconds
      },
      domainShields: {
        // 'domain.com': { enabled: true, blockScripts: false, ... }
      },
      history: [
        { id: '1', title: 'Brave Browser — Secure, Fast & Private', url: 'https://brave.com', visitTime: Date.now() - 3600000, favicon: '' },
        { id: '2', title: 'GitHub: Let’s build from here', url: 'https://github.com', visitTime: Date.now() - 7200000, favicon: '' },
        { id: '3', title: 'Wikipedia, the free encyclopedia', url: 'https://wikipedia.org', visitTime: Date.now() - 10800000, favicon: '' },
        { id: '4', title: 'DuckDuckGo — Privacy, simplified.', url: 'https://duckduckgo.com', visitTime: Date.now() - 86400000, favicon: '' }
      ],
      bookmarks: [
        { id: 'bm_1', title: 'Brave Search', url: 'https://search.brave.com', favicon: '', folder: 'Favorites', dateAdded: Date.now() - 1000000 },
        { id: 'bm_2', title: 'GitHub', url: 'https://github.com', favicon: '', folder: 'Favorites', dateAdded: Date.now() - 900000 },
        { id: 'bm_3', title: 'Wikipedia', url: 'https://en.wikipedia.org', favicon: '', folder: 'Reading', dateAdded: Date.now() - 800000 },
        { id: 'bm_4', title: 'Hacker News', url: 'https://news.ycombinator.com', favicon: '', folder: 'Tech', dateAdded: Date.now() - 700000 },
        { id: 'bm_5', title: 'CoinGecko', url: 'https://www.coingecko.com', favicon: '', folder: 'Crypto', dateAdded: Date.now() - 600000 }
      ],
      topSites: [
        { id: 'ts_1', title: 'Brave Search', url: 'https://search.brave.com', icon: 'search' },
        { id: 'ts_2', title: 'GitHub', url: 'https://github.com', icon: 'github' },
        { id: 'ts_3', title: 'Wikipedia', url: 'https://wikipedia.org', icon: 'book-open' },
        { id: 'ts_4', title: 'YouTube', url: 'https://youtube.com', icon: 'video' },
        { id: 'ts_5', title: 'Reddit', url: 'https://reddit.com', icon: 'message-circle' },
        { id: 'ts_6', title: 'Hacker News', url: 'https://news.ycombinator.com', icon: 'terminal' },
        { id: 'ts_7', title: 'CoinGecko', url: 'https://coingecko.com', icon: 'trending-up' },
        { id: 'ts_8', title: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: 'shield' }
      ],
      rewards: {
        optIn: true,
        batBalance: 14.85,
        batUsdRate: 0.28,
        estimatedEarnings: 3.40,
        attentionScore: 92,
        autoContribute: true,
        tips: [
          { id: 'tip_1', creator: 'Wikipedia Foundation', url: 'https://wikipedia.org', batAmount: 2.0, date: Date.now() - 150000000 },
          { id: 'tip_2', creator: 'The Electronic Frontier Foundation', url: 'https://eff.org', batAmount: 5.0, date: Date.now() - 80000000 }
        ]
      },
      wallet: {
        isUnlocked: true,
        activeNetwork: 'ethereum',
        accounts: [
          {
            name: 'Main Brave Wallet',
            address: '0x71C...a829B',
            fullAddress: '0x71C63F54B06927395029D8481A07d885a42a829B',
            balances: {
              ETH: 1.482,
              SOL: 18.25,
              BTC: 0.054,
              BAT: 420.50,
              USDC: 1250.00
            },
            tokens: [
              { symbol: 'ETH', name: 'Ethereum', balance: '1.482', priceUsd: 3420.00, change24h: '+3.4%' },
              { symbol: 'BAT', name: 'Basic Attention Token', balance: '420.50', priceUsd: 0.28, change24h: '+8.1%' },
              { symbol: 'SOL', name: 'Solana', balance: '18.25', priceUsd: 178.50, change24h: '+5.6%' },
              { symbol: 'USDC', name: 'USD Coin', balance: '1,250.00', priceUsd: 1.00, change24h: '0.0%' }
            ],
            nfts: [
              { id: 'nft_1', name: 'Brave Lion Genesis #1042', collection: 'Brave Explorers', image: 'lion' },
              { id: 'nft_2', name: 'Cyber Privacy Node #77', collection: 'Web3 Protectors', image: 'shield' }
            ]
          }
        ],
        transactions: [
          { id: 'tx_1', type: 'Received', symbol: 'BAT', amount: '+50.0', from: 'Brave Rewards Pool', date: Date.now() - 40000000, status: 'Confirmed' },
          { id: 'tx_2', type: 'Sent', symbol: 'ETH', amount: '-0.15', to: '0x992...33F1', date: Date.now() - 120000000, status: 'Confirmed' },
          { id: 'tx_3', type: 'Swap', symbol: 'USDC to BAT', amount: '100 USDC -> 357 BAT', date: Date.now() - 250000000, status: 'Confirmed' }
        ]
      },
      downloads: [],
      customFilterRules: [
        '! My Custom AdBlock Rules',
        '||doubleclick.net^',
        '||google-analytics.com^',
        '##.advertisement-banner',
        '##.sponsored-post'
      ],
      playlist: [
        { id: 'pl_1', title: 'Why Decentralization Matters', url: 'https://brave.com', savedAt: Date.now() - 3600000, readTime: '4 min' },
        { id: 'pl_2', title: 'Electronic Frontier Foundation: Surveillance Self-Defense', url: 'https://eff.org', savedAt: Date.now() - 7200000, readTime: '6 min' }
      ]
    };
  }

  load() {
    try {
      if (this.storagePath && fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.getDefaults(), ...parsed };
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('[DataStore] Corrupted or missing storage file. Reverting to defaults.', err);
      this.data = this.getDefaults();
      this.save();
    }
  }

  save() {
    try {
      if (this.storagePath) {
        fs.writeFileSync(this.storagePath, JSON.stringify(this.data, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('[DataStore] Failed to write data file:', err);
    }
  }

  get(key) {
    if (!key) return this.data;
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    this.save();
  }

  // --- Shields stats helpers ---
  recordBlockedItem(type, sizeBytes = 15000) {
    if (!this.data.shieldsStats) {
      this.data.shieldsStats = { totalAdsBlocked: 0, totalTrackersBlocked: 0, totalBandwidthSavedBytes: 0, totalTimeSavedMs: 0 };
    }
    if (type === 'ad') {
      this.data.shieldsStats.totalAdsBlocked++;
    } else {
      this.data.shieldsStats.totalTrackersBlocked++;
    }
    this.data.shieldsStats.totalBandwidthSavedBytes += sizeBytes;
    this.data.shieldsStats.totalTimeSavedMs += 40; // ~40ms saved per blocked request
    this.save();
    return this.data.shieldsStats;
  }

  // --- History helpers ---
  addHistory(entry) {
    if (!entry.url || entry.url.startsWith('brave://') || entry.url.startsWith('about:')) return;
    const history = this.data.history || [];
    // Remove duplicate recent entry if visiting same URL in short time
    const filtered = history.filter(h => h.url !== entry.url);
    filtered.unshift({
      id: 'h_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: entry.title || entry.url,
      url: entry.url,
      visitTime: Date.now(),
      favicon: entry.favicon || ''
    });
    // Keep max 5000 items
    if (filtered.length > 5000) filtered.length = 5000;
    this.data.history = filtered;
    this.save();
  }

  clearHistory() {
    this.data.history = [];
    this.save();
  }

  removeHistoryItem(id) {
    this.data.history = (this.data.history || []).filter(h => h.id !== id);
    this.save();
  }

  // --- Bookmarks helpers ---
  addBookmark(bookmark) {
    const list = this.data.bookmarks || [];
    const exists = list.some(b => b.url === bookmark.url);
    if (exists) {
      this.data.bookmarks = list.map(b => b.url === bookmark.url ? { ...b, ...bookmark } : b);
    } else {
      list.push({
        id: bookmark.id || ('bm_' + Date.now()),
        title: bookmark.title || bookmark.url,
        url: bookmark.url,
        favicon: bookmark.favicon || '',
        folder: bookmark.folder || 'Favorites',
        dateAdded: Date.now()
      });
      this.data.bookmarks = list;
    }
    this.save();
    return this.data.bookmarks;
  }

  removeBookmark(idOrUrl) {
    this.data.bookmarks = (this.data.bookmarks || []).filter(b => b.id !== idOrUrl && b.url !== idOrUrl);
    this.save();
    return this.data.bookmarks;
  }

  isBookmarked(url) {
    return (this.data.bookmarks || []).some(b => b.url === url);
  }

  // --- Domain Shields Settings ---
  getDomainShields(hostname) {
    const domainRules = this.data.domainShields || {};
    return domainRules[hostname] || {
      enabled: this.data.settings.shields.globalEnabled,
      blockAds: this.data.settings.shields.blockAds,
      blockTrackers: this.data.settings.shields.blockTrackers,
      blockScripts: this.data.settings.shields.blockScripts,
      fingerprintingProtection: this.data.settings.shields.fingerprintingProtection
    };
  }

  setDomainShields(hostname, shieldsConfig) {
    if (!this.data.domainShields) this.data.domainShields = {};
    this.data.domainShields[hostname] = {
      ...this.getDomainShields(hostname),
      ...shieldsConfig
    };
    this.save();
    return this.data.domainShields[hostname];
  }

  // --- Convenience Getters & Playlist Helpers ---
  getBookmarks() {
    return this.get('bookmarks') || [];
  }

  getHistory() {
    return this.get('history') || [];
  }

  getPlaylist() {
    return this.get('playlist') || [];
  }

  addToPlaylist(item) {
    const list = this.getPlaylist();
    const entry = {
      id: item.id || ('pl_' + Date.now()),
      title: item.title || item.url,
      url: item.url,
      savedAt: item.savedAt || Date.now(),
      readTime: item.readTime || '3 min'
    };
    list.unshift(entry);
    this.set('playlist', list);
    return list;
  }

  removeFromPlaylist(id) {
    const list = this.getPlaylist().filter(p => p.id !== id);
    this.set('playlist', list);
    return list;
  }
}

const store = new DataStore();
export { store, DataStore };
export default store;
