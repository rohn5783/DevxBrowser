/**
 * Brave Browser Web Adapter & Polyfill for Vercel / Web Deployment
 * Automatically detects if running in a standard web browser (Vercel)
 * and provides full in-memory/localStorage API mocks and <webview> fallback.
 */

(function () {
  'use strict';

  // If running in desktop Electron, window.braveAPI is already provided by preload
  if (window.braveAPI) {
    console.log('[Brave] Running in native Electron environment.');
    return;
  }

  console.log('[Brave Web Adapter] Initializing for Vercel / Browser deployment...');

  // 1. Initial Storage State for Web Mode
  const STORAGE_KEY = 'brave_web_data_v1';
  const defaultData = {
    bookmarks: [
      { id: '1', title: 'Brave Search', url: 'https://search.brave.com' },
      { id: '2', title: 'GitHub', url: 'https://github.com' },
      { id: '3', title: 'Wikipedia', url: 'https://wikipedia.org' },
      { id: '4', title: 'Hacker News', url: 'https://news.ycombinator.com' },
      { id: '5', title: 'CoinGecko', url: 'https://coingecko.com' }
    ],
    history: [
      { id: 'h1', title: 'Brave Browser — Secure, Fast & Private', url: 'https://brave.com', visitTime: Date.now() - 3600000 },
      { id: 'h2', title: 'GitHub: Let’s build from here', url: 'https://github.com', visitTime: Date.now() - 7200000 },
      { id: 'h3', title: 'Wikipedia, the free encyclopedia', url: 'https://wikipedia.org', visitTime: Date.now() - 10800000 }
    ],
    shieldsStats: {
      totalAdsBlocked: 2285,
      totalTrackersBlocked: 1140,
      totalBandwidthSavedBytes: 28100000,
      totalTimeSavedMs: 45000
    },
    domainShields: {},
    playlist: [
      { id: 'pl_1', title: 'Why Decentralization Matters', url: 'https://brave.com', savedAt: Date.now() - 3600000, readTime: '4 min' },
      { id: 'pl_2', title: 'Surveillance Self-Defense', url: 'https://eff.org', savedAt: Date.now() - 7200000, readTime: '6 min' }
    ],
    wallet: {
      isUnlocked: true,
      activeNetwork: 'ethereum',
      accounts: [
        {
          name: 'Main Brave Wallet',
          address: '0x71C...a829B',
          fullAddress: '0x71C63F54B06927395029D8481A07d885a42a829B',
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
        { id: 'tx_1', type: 'Received', symbol: 'BAT', amount: '+50.0', from: 'Brave Rewards Pool', date: Date.now() - 40000000, status: 'Confirmed' }
      ]
    },
    rewards: {
      optIn: true,
      batBalance: 14.85,
      batUsdRate: 0.28,
      estimatedEarnings: 3.40,
      tips: [
        { id: 'tip_1', creator: 'Wikipedia Foundation', url: 'https://wikipedia.org', batAmount: 2.0, date: Date.now() - 150000000 }
      ]
    },
    settings: {
      appearance: { theme: 'dark', tabLayout: 'horizontal', showBookmarksBar: true },
      shields: { globalEnabled: true, blockAds: true, blockTrackers: true, fingerprintingProtection: 'standard' }
    }
  };

  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultData;
    } catch {
      return defaultData;
    }
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  let db = loadData();

  // Helper to resolve brave:// protocol URLs to internal paths
  function resolveBraveUrl(inputUrl) {
    if (!inputUrl) return '/brave/newtab';
    if (inputUrl.startsWith('brave://')) {
      const page = inputUrl.replace('brave://', '').replace(/\/$/, '');
      return `/brave/${page || 'newtab'}`;
    }
    return inputUrl;
  }

  // 2. Web Polyfill for window.braveAPI
  window.braveAPI = {
    getWebviewPreloadPath: () => '',
    // Window controls
    minimize: () => {
      console.log('[Web Mode] Minimize window');
    },
    maximize: () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    },
    close: () => {
      alert('In Web Mode, close this browser tab to exit.');
    },
    isMaximized: () => !!document.fullscreenElement,

    // Shields & Stats
    getShieldsStats: async () => db.shieldsStats,
    getDomainShields: async (domain) => db.domainShields[domain] || { enabled: true, blockTrackers: true, blockScripts: false },
    setDomainShields: async (domain, config) => {
      db.domainShields[domain] = { ...(db.domainShields[domain] || {}), ...config };
      saveData(db);
      return db.domainShields[domain];
    },
    onShieldsUpdated: () => {},

    // Bookmarks
    getBookmarks: async () => db.bookmarks,
    addBookmark: async (bm) => {
      db.bookmarks = db.bookmarks.filter(b => b.url !== bm.url);
      db.bookmarks.push({ ...bm, id: bm.id || ('bm_' + Date.now()) });
      saveData(db);
      return db.bookmarks;
    },
    removeBookmark: async (id) => {
      db.bookmarks = db.bookmarks.filter(b => b.id !== id);
      saveData(db);
      return db.bookmarks;
    },
    isBookmarked: async (url) => db.bookmarks.some(b => b.url === url),

    // History
    getHistory: async () => db.history,
    clearHistory: async () => {
      db.history = [];
      saveData(db);
      return true;
    },
    removeHistoryItem: async (id) => {
      db.history = db.history.filter(h => h.id !== id);
      saveData(db);
      return true;
    },
    addHistory: async (entry) => {
      db.history.unshift({ ...entry, id: 'h_' + Date.now(), visitTime: Date.now() });
      saveData(db);
      return true;
    },

    // Leo AI Assistant
    chatWithLeo: async ({ message, pageContext, model }) => {
      const lower = (message || '').toLowerCase();
      if (lower.includes('summarize')) {
        return `### 🦁 Brave Leo Summary (${model || 'Llama 3'})\n\nThis page demonstrates the fully interactive **Brave Browser Web Simulator** running on Vercel!\n\n• **Brave Shields**: Real-time tracker & ad blocker\n• **Brave Leo AI**: Private AI companion\n• **Brave Wallet & Rewards**: Web3 token management\n• **Tor Mode**: Multi-relay onion privacy\n\n> *Encrypted & served securely via Vercel Edge.*`;
      }
      if (lower.includes('wallet') || lower.includes('bat') || lower.includes('crypto')) {
        return `### 🪙 Brave Wallet & BAT\n\nYour Brave Wallet has an active balance of **${db.wallet.accounts[0].tokens[1].balance} BAT** and **${db.wallet.accounts[0].tokens[0].balance} ETH**. You can swap tokens and tip verified creators anytime!`;
      }
      return `Hello from **Brave Leo** on Vercel! I am your private built-in AI assistant. I can summarize pages, draft messages, and answer questions without sharing your data with advertisers.`;
    },
    summarizePage: async () => ({
      summary: `### 🦁 Executive Page Summary\n\n• Fully responsive Brave Browser interface\n• Private, distraction-free browsing experience\n• Native glassmorphic UI and multi-tab switcher`,
      keyPoints: ['Responsive layout', 'Built-in privacy', 'Zero telemetry']
    }),
    getLeoModels: async () => [
      { id: 'leo-llama-3-8b', name: 'Llama 3 8B (Default)' },
      { id: 'leo-claude-3-5', name: 'Claude 3.5 Sonnet' },
      { id: 'leo-mixtral-8x7b', name: 'Mixtral 8x7B' }
    ],

    // Top Sites
    getTopSites: async () => [
      { id: 'ts_1', title: 'Brave Search', url: 'https://search.brave.com' },
      { id: 'ts_2', title: 'GitHub', url: 'https://github.com' },
      { id: 'ts_3', title: 'Wikipedia', url: 'https://wikipedia.org' },
      { id: 'ts_4', title: 'YouTube', url: 'https://youtube.com' },
      { id: 'ts_5', title: 'CoinGecko', url: 'https://coingecko.com' }
    ],
    saveTopSites: async () => {},

    // Wallet & Rewards
    getWalletData: async () => db.wallet,
    swapTokens: async (swap) => {
      db.wallet.transactions.unshift({
        id: 'tx_' + Date.now(),
        type: 'Swap',
        symbol: `${swap.fromSymbol} to ${swap.toSymbol}`,
        amount: `${swap.fromAmount} ${swap.fromSymbol} -> ${swap.toAmount} ${swap.toSymbol}`,
        date: Date.now(),
        status: 'Confirmed'
      });
      saveData(db);
      return db.wallet;
    },
    getRewardsData: async () => db.rewards,
    sendTip: async (tip) => {
      db.rewards.batBalance = Math.max(0, +(db.rewards.batBalance - tip.amount).toFixed(2));
      db.rewards.tips.unshift({
        id: 'tip_' + Date.now(),
        creator: tip.creator || 'Verified Publisher',
        url: tip.url,
        batAmount: tip.amount,
        date: Date.now()
      });
      saveData(db);
      return db.rewards;
    },

    // Tor Circuit
    getTorCircuit: async () => ({
      connected: true,
      status: 'Protected via Onion Routing (Vercel Edge)',
      ip: '178.17.170.89',
      circuit: [
        { role: 'Client', ip: '127.0.0.1', country: 'Your Browser', flag: '💻' },
        { role: 'Guard Relay', ip: '185.220.101.5', country: 'Germany (DE)', flag: '🇩🇪', latency: '24ms' },
        { role: 'Middle Relay', ip: '193.187.91.12', country: 'Iceland (IS)', flag: '🇮🇸', latency: '48ms' },
        { role: 'Exit Node', ip: '178.17.170.89', country: 'Netherlands (NL)', flag: '🇳🇱', latency: '65ms' }
      ]
    }),
    newTorCircuit: async () => ({
      connected: true,
      status: 'New Onion Circuit Established',
      ip: '51.15.43.205',
      circuit: [
        { role: 'Client', ip: '127.0.0.1', country: 'Your Browser', flag: '💻' },
        { role: 'Guard Relay', ip: '198.51.100.42', country: 'Switzerland (CH)', flag: '🇨🇭', latency: '29ms' },
        { role: 'Middle Relay', ip: '109.70.100.25', country: 'Austria (AT)', flag: '🇦🇹', latency: '41ms' },
        { role: 'Exit Node', ip: '51.15.43.205', country: 'Luxembourg (LU)', flag: '🇱🇺', latency: '58ms' }
      ]
    }),

    // Settings
    getSettings: async () => db.settings,
    updateSettings: async (newSettings) => {
      db.settings = { ...db.settings, ...newSettings };
      saveData(db);
      return db.settings;
    },

    // Security & Filters
    forgetDomain: async () => true,
    getCustomFilters: async () => ['||doubleclick.net^', '||google-analytics.com^'],
    saveCustomFilters: async () => true,
    cleanUrl: async (u) => {
      try {
        const urlObj = new URL(u);
        const toDelete = [];
        for (const [k] of urlObj.searchParams.entries()) {
          if (k.startsWith('utm_') || k === 'fbclid' || k === 'gclid') toDelete.push(k);
        }
        toDelete.forEach(k => urlObj.searchParams.delete(k));
        return urlObj.toString();
      } catch {
        return u;
      }
    },

    // Playlist
    getPlaylist: async () => db.playlist,
    addToPlaylist: async (item) => {
      db.playlist.unshift({ ...item, id: 'pl_' + Date.now(), savedAt: Date.now() });
      saveData(db);
      return db.playlist;
    },
    removeFromPlaylist: async (id) => {
      db.playlist = db.playlist.filter(p => p.id !== id);
      saveData(db);
      return db.playlist;
    },

    onTabUpdated: () => {},
    onDownloadProgress: () => {}
  };

  // 3. Web Polyfill for Electron <webview> Element
  // When running on the web, <webview> is replaced with a responsive <iframe>
  if (typeof customElements !== 'undefined' && !customElements.get('webview')) {
    class WebviewPolyfill extends HTMLElement {
      connectedCallback() {
        if (this._initialized) return;
        this._initialized = true;

        this._iframe = document.createElement('iframe');
        this._iframe.style.width = '100%';
        this._iframe.style.height = '100%';
        this._iframe.style.border = 'none';
        this._iframe.setAttribute('allow', 'fullscreen; camera; microphone; payment');

        const initialSrc = this.getAttribute('src');
        if (initialSrc) {
          this._iframe.src = resolveBraveUrl(initialSrc);
        }

        this.appendChild(this._iframe);

        this._iframe.addEventListener('load', () => {
          this.dispatchEvent(new CustomEvent('did-stop-loading'));
          try {
            const currentUrl = this._iframe.contentWindow?.location?.href || this._iframe.src;
            this.dispatchEvent(new CustomEvent('did-navigate', { detail: { url: currentUrl } }));
            const title = this._iframe.contentDocument?.title;
            if (title) {
              this.dispatchEvent(new CustomEvent('page-title-updated', { detail: { title } }));
            }
          } catch {}
        });
      }

      static get observedAttributes() {
        return ['src'];
      }

      attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'src' && this._iframe && newValue !== oldValue) {
          this.dispatchEvent(new CustomEvent('did-start-loading'));
          this._iframe.src = resolveBraveUrl(newValue);
        }
      }

      loadURL(url) {
        this.setAttribute('src', url);
      }

      reload() {
        if (this._iframe) this._iframe.src = this._iframe.src;
      }

      stop() {}

      canGoBack() {
        return false;
      }

      canGoForward() {
        return false;
      }

      goBack() {}
      goForward() {}

      async executeJavaScript(code) {
        try {
          return this._iframe.contentWindow?.eval?.(code);
        } catch {
          return null;
        }
      }

      setZoomLevel() {}
      stopFindInPage() {}
      findInPage() {}
      setAudioMuted() {}
    }

    customElements.define('webview', WebviewPolyfill);
    console.log('[Brave Web Adapter] <webview> custom element polyfill registered.');
  }
})();
