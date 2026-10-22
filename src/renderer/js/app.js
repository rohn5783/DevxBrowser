/**
 * App.js - Main Application Orchestrator for Brave Browser
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inject SVG Icons into placeholders
  const braveLogoSvg = document.getElementById('braveLogoSvg');
  if (braveLogoSvg && window.ICONS) braveLogoSvg.innerHTML = window.ICONS.lion;

  const shieldsLionSvg = document.getElementById('shieldsLionSvg');
  if (shieldsLionSvg && window.ICONS) shieldsLionSvg.innerHTML = window.ICONS.lion;

  const popoverLionSvg = document.getElementById('popoverLionSvg');
  if (popoverLionSvg && window.ICONS) popoverLionSvg.innerHTML = window.ICONS.lion;

  // 2. Initialize Controllers
  const tabManager = window.tabManager;
  const omnibox = new window.OmniboxController();
  const shieldsUI = new window.ShieldsUI();
  const leoUI = new window.LeoUI();
  const bookmarksBar = new window.BookmarksBar();
  window.bookmarksBar = bookmarksBar;

  // 3. Navigation Controls
  const backBtn = document.getElementById('backBtn');
  const forwardBtn = document.getElementById('forwardBtn');
  const reloadBtn = document.getElementById('reloadBtn');
  const homeBtn = document.getElementById('homeBtn');
  const newTabBtn = document.getElementById('newTabBtn');

  backBtn.addEventListener('click', () => {
    const active = tabManager.getActiveTab();
    if (active && active.webview && active.webview.canGoBack()) {
      active.webview.goBack();
    }
  });

  forwardBtn.addEventListener('click', () => {
    const active = tabManager.getActiveTab();
    if (active && active.webview && active.webview.canGoForward()) {
      active.webview.goForward();
    }
  });

  reloadBtn.addEventListener('click', () => {
    const active = tabManager.getActiveTab();
    if (active && active.webview) {
      if (active.isLoading) {
        active.webview.stop();
      } else {
        active.webview.reload();
      }
    }
  });

  homeBtn.addEventListener('click', () => {
    const active = tabManager.getActiveTab();
    if (active && active.webview) {
      active.webview.loadURL('brave://newtab');
    }
  });

  newTabBtn.addEventListener('click', () => {
    tabManager.createTab('brave://newtab', true);
  });

  // 4. Window Titlebar Controls (Minimize, Maximize, Close)
  const minBtn = document.getElementById('minBtn');
  const maxBtn = document.getElementById('maxBtn');
  const closeBtn = document.getElementById('closeBtn');

  if (window.braveAPI) {
    minBtn.addEventListener('click', () => window.braveAPI.minimize());
    maxBtn.addEventListener('click', () => window.braveAPI.maximize());
    closeBtn.addEventListener('click', () => window.braveAPI.close());
  }

  // 5. Action Buttons (Wallet, Rewards, Menu)
  const walletBtn = document.getElementById('walletBtn');
  const rewardsBtn = document.getElementById('rewardsBtn');
  const menuBtn = document.getElementById('menuBtn');
  const browserMenuDropdown = document.getElementById('browserMenuDropdown');

  walletBtn.addEventListener('click', () => {
    tabManager.createTab('brave://wallet', true);
  });

  rewardsBtn.addEventListener('click', () => {
    tabManager.createTab('brave://rewards', true);
  });

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    browserMenuDropdown.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#browserMenuDropdown') && !e.target.closest('#menuBtn')) {
      browserMenuDropdown.classList.remove('open');
    }
  });

  // Menu Dropdown items
  document.getElementById('menuNewTab')?.addEventListener('click', () => {
    tabManager.createTab('brave://newtab', true);
    browserMenuDropdown.classList.remove('open');
  });

  document.getElementById('menuTorWindow')?.addEventListener('click', () => {
    tabManager.createTab('brave://tor', true);
    browserMenuDropdown.classList.remove('open');
  });

  document.getElementById('menuHistory')?.addEventListener('click', () => {
    tabManager.createTab('brave://history', true);
    browserMenuDropdown.classList.remove('open');
  });

  document.getElementById('menuBookmarks')?.addEventListener('click', () => {
    tabManager.createTab('brave://bookmarks', true);
    browserMenuDropdown.classList.remove('open');
  });

  document.getElementById('menuDownloads')?.addEventListener('click', () => {
    tabManager.createTab('brave://downloads', true);
    browserMenuDropdown.classList.remove('open');
  });

  document.getElementById('menuWallet')?.addEventListener('click', () => {
    tabManager.createTab('brave://wallet', true);
    browserMenuDropdown.classList.remove('open');
  });

  document.getElementById('menuRewards')?.addEventListener('click', () => {
    tabManager.createTab('brave://rewards', true);
    browserMenuDropdown.classList.remove('open');
  });

  document.getElementById('menuPlaylist')?.addEventListener('click', () => {
    tabManager.createTab('brave://playlist', true);
    browserMenuDropdown.classList.remove('open');
  });

  document.getElementById('menuShields')?.addEventListener('click', () => {
    tabManager.createTab('brave://shields', true);
    browserMenuDropdown.classList.remove('open');
  });

  document.getElementById('menuSettings')?.addEventListener('click', () => {
    tabManager.createTab('brave://settings', true);
    browserMenuDropdown.classList.remove('open');
  });

  // Zoom Controls
  let zoomLevel = 0;
  const zoomLevelText = document.getElementById('zoomLevelText');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');

  function updateZoom(delta) {
    zoomLevel += delta;
    if (zoomLevel < -3) zoomLevel = -3;
    if (zoomLevel > 3) zoomLevel = 3;

    const percent = Math.round(Math.pow(1.2, zoomLevel) * 100);
    if (zoomLevelText) zoomLevelText.textContent = `${percent}%`;

    const active = tabManager.getActiveTab();
    if (active && active.webview) {
      active.webview.setZoomLevel(zoomLevel);
    }
  }

  zoomInBtn?.addEventListener('click', () => updateZoom(0.5));
  zoomOutBtn?.addEventListener('click', () => updateZoom(-0.5));

  // 6. Find in Page (Ctrl+F)
  const findBar = document.getElementById('findBar');
  const findInput = document.getElementById('findInput');
  const findCount = document.getElementById('findCount');
  const findPrevBtn = document.getElementById('findPrevBtn');
  const findNextBtn = document.getElementById('findNextBtn');
  const findCloseBtn = document.getElementById('findCloseBtn');

  function openFindBar() {
    findBar.classList.add('open');
    findInput.focus();
    findInput.select();
  }

  function closeFindBar() {
    findBar.classList.remove('open');
    const active = tabManager.getActiveTab();
    if (active && active.webview) {
      active.webview.stopFindInPage('clearSelection');
    }
    findCount.textContent = '0/0';
  }

  document.getElementById('menuFindInPage')?.addEventListener('click', () => {
    browserMenuDropdown.classList.remove('open');
    openFindBar();
  });

  findCloseBtn.addEventListener('click', closeFindBar);

  findInput.addEventListener('input', () => {
    const text = findInput.value.trim();
    const active = tabManager.getActiveTab();
    if (active && active.webview) {
      if (text) {
        active.webview.findInPage(text, { forward: true, findNext: false });
      } else {
        active.webview.stopFindInPage('clearSelection');
        findCount.textContent = '0/0';
      }
    }
  });

  findNextBtn.addEventListener('click', () => {
    const text = findInput.value.trim();
    const active = tabManager.getActiveTab();
    if (active && active.webview && text) {
      active.webview.findInPage(text, { forward: true, findNext: true });
    }
  });

  findPrevBtn.addEventListener('click', () => {
    const text = findInput.value.trim();
    const active = tabManager.getActiveTab();
    if (active && active.webview && text) {
      active.webview.findInPage(text, { forward: false, findNext: true });
    }
  });

  // Listen to find-in-page match results
  tabManager.onActiveTabChange((tab) => {
    if (!tab || !tab.webview) return;
    tab.webview.addEventListener('found-in-page', (e) => {
      findCount.textContent = `${e.result.activeMatchOrdinal}/${e.result.matches}`;
    });
  });

  // 7. Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const isCtrl = e.ctrlKey || e.metaKey;

    // Ctrl+T: New Tab
    if (isCtrl && e.key.toLowerCase() === 't') {
      e.preventDefault();
      tabManager.createTab('brave://newtab', true);
    }
    // Ctrl+W: Close Tab
    else if (isCtrl && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      const active = tabManager.getActiveTab();
      if (active) tabManager.closeTab(active.id);
    }
    // Ctrl+R or F5: Reload
    else if ((isCtrl && e.key.toLowerCase() === 'r') || e.key === 'F5') {
      e.preventDefault();
      const active = tabManager.getActiveTab();
      if (active && active.webview) active.webview.reload();
    }
    // Ctrl+L or Alt+D: Focus Omnibox
    else if ((isCtrl && e.key.toLowerCase() === 'l') || (e.altKey && e.key.toLowerCase() === 'd')) {
      e.preventDefault();
      const input = document.getElementById('omniboxInput');
      if (input) {
        input.focus();
        input.select();
      }
    }
    // Ctrl+H: History
    else if (isCtrl && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      tabManager.createTab('brave://history', true);
    }
    // Ctrl+B: Bookmarks
    else if (isCtrl && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      tabManager.createTab('brave://bookmarks', true);
    }
    // Ctrl+J: Downloads
    else if (isCtrl && e.key.toLowerCase() === 'j') {
      e.preventDefault();
      tabManager.createTab('brave://downloads', true);
    }
    // Ctrl+Shift+N: Tor Private Window
    else if (isCtrl && e.shiftKey && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      tabManager.createTab('brave://tor', true);
    }
    // Ctrl+F: Find in page
    else if (isCtrl && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      openFindBar();
    }
    // Esc: Close find bar or modals
    else if (e.key === 'Escape') {
      closeFindBar();
      browserMenuDropdown.classList.remove('open');
      shieldsUI.closePopover();
    }
    // Zoom in / out shortcuts
    else if (isCtrl && (e.key === '=' || e.key === '+')) {
      e.preventDefault();
      updateZoom(0.5);
    }
    else if (isCtrl && e.key === '-') {
      e.preventDefault();
      updateZoom(-0.5);
    }
    else if (isCtrl && e.key === '0') {
      e.preventDefault();
      zoomLevel = 0;
      updateZoom(0);
    }
  });

  // 8. Open initial New Tab!
  tabManager.createTab('brave://newtab', true);
});
