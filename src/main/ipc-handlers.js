import electron from 'electron';
const { ipcMain, app } = (typeof electron === 'object' && electron) ? electron : {};
import store from './storage/store.js';
import shieldsEngine from './shields/shields-engine.js';
import leoService from './ai/leo-service.js';
import torManager from './tor/tor-session.js';

function setupIpcHandlers(mainWindow) {
  // --- Window controls ---
  ipcMain.handle('window:minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (!mainWindow) return false;
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      return false;
    } else {
      mainWindow.maximize();
      return true;
    }
  });

  ipcMain.handle('window:close', () => {
    if (mainWindow) mainWindow.close();
  });

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false;
  });

  // --- Shields ---
  ipcMain.handle('shields:getStats', () => {
    return store.get('shieldsStats');
  });

  ipcMain.handle('shields:getDomain', (_event, domain) => {
    return store.getDomainShields(domain);
  });

  ipcMain.handle('shields:setDomain', (_event, { domain, config }) => {
    return store.setDomainShields(domain, config);
  });

  // Wire up shields engine block notification to renderer
  shieldsEngine.setBlockCallback((webContentsId, stats) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('shields:updated', { webContentsId, stats });
    }
  });

  // --- Leo AI ---
  ipcMain.handle('leo:chat', async (_event, payload) => {
    return await leoService.chat(payload);
  });

  ipcMain.handle('leo:summarize', async (_event, payload) => {
    return await leoService.summarizePage(payload);
  });

  ipcMain.handle('leo:models', () => {
    return leoService.getAvailableModels();
  });

  // --- Bookmarks ---
  ipcMain.handle('bookmarks:get', () => {
    return store.get('bookmarks');
  });

  ipcMain.handle('bookmarks:add', (_event, bm) => {
    return store.addBookmark(bm);
  });

  ipcMain.handle('bookmarks:remove', (_event, id) => {
    return store.removeBookmark(id);
  });

  ipcMain.handle('bookmarks:check', (_event, url) => {
    return store.isBookmarked(url);
  });

  // --- History ---
  ipcMain.handle('history:get', () => {
    return store.get('history');
  });

  ipcMain.handle('history:add', (_event, entry) => {
    store.addHistory(entry);
    return true;
  });

  ipcMain.handle('history:clear', () => {
    store.clearHistory();
    return true;
  });

  ipcMain.handle('history:remove', (_event, id) => {
    store.removeHistoryItem(id);
    return true;
  });

  // --- Top Sites ---
  ipcMain.handle('topsites:get', () => {
    return store.get('topSites');
  });

  ipcMain.handle('topsites:save', (_event, sites) => {
    store.set('topSites', sites);
    return sites;
  });

  // --- Wallet & Rewards ---
  ipcMain.handle('wallet:get', () => {
    return store.get('wallet');
  });

  ipcMain.handle('wallet:swap', (_event, swapData) => {
    const wallet = store.get('wallet');
    wallet.transactions.unshift({
      id: 'tx_' + Date.now(),
      type: 'Swap',
      symbol: `${swapData.fromSymbol} to ${swapData.toSymbol}`,
      amount: `${swapData.fromAmount} ${swapData.fromSymbol} -> ${swapData.toAmount} ${swapData.toSymbol}`,
      date: Date.now(),
      status: 'Confirmed'
    });
    store.set('wallet', wallet);
    return wallet;
  });

  ipcMain.handle('rewards:get', () => {
    return store.get('rewards');
  });

  ipcMain.handle('rewards:tip', (_event, tip) => {
    const rewards = store.get('rewards');
    rewards.batBalance = Math.max(0, +(rewards.batBalance - tip.amount).toFixed(2));
    rewards.tips.unshift({
      id: 'tip_' + Date.now(),
      creator: tip.creator || 'Verified Publisher',
      url: tip.url,
      batAmount: tip.amount,
      date: Date.now()
    });
    store.set('rewards', rewards);
    return rewards;
  });

  // --- Tor ---
  ipcMain.handle('tor:getCircuit', () => {
    return torManager.getCircuit();
  });

  ipcMain.handle('tor:newCircuit', () => {
    return torManager.regenerateCircuit();
  });

  // --- Settings ---
  ipcMain.handle('settings:get', () => {
    return store.get('settings');
  });

  ipcMain.handle('settings:update', (_event, newSettings) => {
    const cur = store.get('settings');
    const updated = { ...cur, ...newSettings };
    store.set('settings', updated);
    return updated;
  });

  // --- Advanced Security: Forgetful Browsing ---
  ipcMain.handle('shields:forgetDomain', async (_event, hostname) => {
    await shieldsEngine.forgetDomainStorage(hostname);
    return true;
  });

  // --- Advanced Security: Custom Filter Lists ---
  ipcMain.handle('shields:getFilters', () => {
    return store.get('customFilterRules') || [];
  });

  ipcMain.handle('shields:saveFilters', (_event, rules) => {
    store.set('customFilterRules', rules);
    shieldsEngine.loadCustomRules();
    return true;
  });

  // --- Advanced Security: Clean URLs / Tracking Stripping ---
  ipcMain.handle('url:clean', (_event, targetUrl) => {
    return shieldsEngine.cleanTrackingParameters(targetUrl) || targetUrl;
  });

  // --- Brave Playlist / Reading List ---
  ipcMain.handle('playlist:get', () => {
    return store.get('playlist') || [];
  });

  ipcMain.handle('playlist:add', (_event, item) => {
    const list = store.get('playlist') || [];
    list.unshift({
      id: 'pl_' + Date.now(),
      title: item.title || item.url,
      url: item.url,
      savedAt: Date.now(),
      readTime: item.readTime || '3 min'
    });
    store.set('playlist', list);
    return list;
  });

  ipcMain.handle('playlist:remove', (_event, id) => {
    const list = (store.get('playlist') || []).filter(p => p.id !== id);
    store.set('playlist', list);
    return list;
  });
}

export { setupIpcHandlers };
export default setupIpcHandlers;
