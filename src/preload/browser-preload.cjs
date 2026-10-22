const { contextBridge, ipcRenderer } = require('electron');
const path = require('node:path');
const url = require('node:url');

contextBridge.exposeInMainWorld('braveAPI', {
  getWebviewPreloadPath: () => {
    return url.pathToFileURL(path.join(__dirname, 'webview-preload.cjs')).toString();
  },
  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),

  // Tabs
  createTab: (url, active = true) => ipcRenderer.invoke('tab:create', { url, active }),
  closeTab: (tabId) => ipcRenderer.invoke('tab:close', tabId),
  activateTab: (tabId) => ipcRenderer.invoke('tab:activate', tabId),
  duplicateTab: (tabId) => ipcRenderer.invoke('tab:duplicate', tabId),

  // Navigation
  navigate: (url) => ipcRenderer.invoke('nav:go', url),
  goBack: () => ipcRenderer.invoke('nav:back'),
  goForward: () => ipcRenderer.invoke('nav:forward'),
  reload: (ignoreCache = false) => ipcRenderer.invoke('nav:reload', ignoreCache),
  stop: () => ipcRenderer.invoke('nav:stop'),
  zoomIn: () => ipcRenderer.invoke('nav:zoomIn'),
  zoomOut: () => ipcRenderer.invoke('nav:zoomOut'),
  zoomReset: () => ipcRenderer.invoke('nav:zoomReset'),

  // Shields & Security
  getShieldsStats: () => ipcRenderer.invoke('shields:getStats'),
  getDomainShields: (domain) => ipcRenderer.invoke('shields:getDomain', domain),
  setDomainShields: (domain, config) => ipcRenderer.invoke('shields:setDomain', { domain, config }),
  onShieldsUpdated: (callback) => {
    ipcRenderer.on('shields:updated', (_event, data) => callback(data));
  },

  // Leo AI
  chatWithLeo: (payload) => ipcRenderer.invoke('leo:chat', payload),
  summarizePage: (payload) => ipcRenderer.invoke('leo:summarize', payload),
  getLeoModels: () => ipcRenderer.invoke('leo:models'),

  // Bookmarks
  getBookmarks: () => ipcRenderer.invoke('bookmarks:get'),
  addBookmark: (bm) => ipcRenderer.invoke('bookmarks:add', bm),
  removeBookmark: (id) => ipcRenderer.invoke('bookmarks:remove', id),
  isBookmarked: (url) => ipcRenderer.invoke('bookmarks:check', url),

  // History
  getHistory: () => ipcRenderer.invoke('history:get'),
  clearHistory: () => ipcRenderer.invoke('history:clear'),
  removeHistoryItem: (id) => ipcRenderer.invoke('history:remove', id),

  // Top Sites
  getTopSites: () => ipcRenderer.invoke('topsites:get'),
  saveTopSites: (sites) => ipcRenderer.invoke('topsites:save', sites),

  // Wallet & Rewards
  getWalletData: () => ipcRenderer.invoke('wallet:get'),
  getRewardsData: () => ipcRenderer.invoke('rewards:get'),
  sendTip: (tip) => ipcRenderer.invoke('rewards:tip', tip),
  swapTokens: (swap) => ipcRenderer.invoke('wallet:swap', swap),

  // Tor Circuit
  getTorCircuit: () => ipcRenderer.invoke('tor:getCircuit'),
  newTorCircuit: () => ipcRenderer.invoke('tor:newCircuit'),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (newSettings) => ipcRenderer.invoke('settings:update', newSettings),

  // Find in page
  findInPage: (text, forward = true) => ipcRenderer.invoke('find:start', { text, forward }),
  stopFindInPage: (action = 'clearSelection') => ipcRenderer.invoke('find:stop', action),

  // Advanced Security & Privacy
  forgetDomain: (hostname) => ipcRenderer.invoke('shields:forgetDomain', hostname),
  getCustomFilters: () => ipcRenderer.invoke('shields:getFilters'),
  saveCustomFilters: (rules) => ipcRenderer.invoke('shields:saveFilters', rules),
  cleanUrl: (targetUrl) => ipcRenderer.invoke('url:clean', targetUrl),

  // Brave Playlist
  getPlaylist: () => ipcRenderer.invoke('playlist:get'),
  addToPlaylist: (item) => ipcRenderer.invoke('playlist:add', item),
  removeFromPlaylist: (id) => ipcRenderer.invoke('playlist:remove', id),

  // General event listeners from main
  onTabUpdated: (callback) => {
    ipcRenderer.on('tab:updated', (_event, data) => callback(data));
  },
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download:progress', (_event, data) => callback(data));
  }
});
