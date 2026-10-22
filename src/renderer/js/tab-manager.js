/**
 * TabManager - Manages multi-tab browser lifecycle and webviews
 */

class TabManager {
  constructor() {
    this.tabs = [];
    this.activeTabId = null;
    this.tabStrip = document.getElementById('tabStrip');
    this.tabStripContainer = document.getElementById('tabStripContainer');
    this.verticalTabsList = document.getElementById('verticalTabsList');
    this.toggleVerticalTabsBtn = document.getElementById('toggleVerticalTabsBtn');
    this.newVerticalTabBtn = document.getElementById('newVerticalTabBtn');
    this.webviewsContainer = document.getElementById('webviewsContainer');
    this.onActiveTabChangeCallbacks = [];
    this.isVerticalTabs = false;

    if (this.toggleVerticalTabsBtn) {
      this.toggleVerticalTabsBtn.addEventListener('click', () => this.toggleVerticalTabs());
    }
    if (this.newVerticalTabBtn) {
      this.newVerticalTabBtn.addEventListener('click', () => this.createTab('brave://newtab', true));
    }
  }

  toggleVerticalTabs() {
    this.isVerticalTabs = !this.isVerticalTabs;
    const win = document.querySelector('.browser-window');
    if (win) {
      win.classList.toggle('vertical-tabs-mode', this.isVerticalTabs);
    }
    if (this.toggleVerticalTabsBtn) {
      this.toggleVerticalTabsBtn.classList.toggle('active', this.isVerticalTabs);
    }

    if (this.isVerticalTabs && this.verticalTabsList) {
      this.verticalTabsList.appendChild(this.tabStrip);
    } else if (this.tabStripContainer) {
      this.tabStripContainer.insertBefore(this.tabStrip, document.getElementById('newTabBtn'));
    }
  }

  async toggleSpeedReader() {
    const active = this.getActiveTab();
    if (!active || !active.webview) return;
    try {
      await active.webview.executeJavaScript('window.__brave_toggle_speedreader ? window.__brave_toggle_speedreader() : null');
    } catch (e) {}
  }

  onActiveTabChange(cb) {
    this.onActiveTabChangeCallbacks.push(cb);
  }

  getActiveTab() {
    return this.tabs.find(t => t.id === this.activeTabId) || null;
  }

  createTab(initialUrl = 'brave://newtab', activate = true) {
    const tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    // 1. Create Webview element
    const webview = document.createElement('webview');
    webview.id = `wv_${tabId}`;
    webview.className = 'webview-instance';
    webview.setAttribute('src', initialUrl);
    const preloadPath = (window.braveAPI && window.braveAPI.getWebviewPreloadPath) 
      ? window.braveAPI.getWebviewPreloadPath() 
      : '../preload/webview-preload.cjs';
    webview.setAttribute('preload', preloadPath);
    webview.setAttribute('allowpopups', 'true');
    webview.setAttribute('webpreferences', 'contextIsolation=yes');

    this.webviewsContainer.appendChild(webview);

    // 2. Tab state object
    const tab = {
      id: tabId,
      url: initialUrl,
      title: initialUrl.startsWith('brave://') ? 'New Tab' : 'Loading...',
      favicon: '',
      isLoading: true,
      isAudioPlaying: false,
      isMuted: false,
      isPinned: false,
      blockedCount: 0,
      blockedItems: [],
      webview: webview,
      tabEl: null
    };

    // 3. Create DOM Tab Element
    const tabEl = document.createElement('div');
    tabEl.className = 'tab';
    tabEl.id = `tab_el_${tabId}`;
    tabEl.innerHTML = `
      <div class="tab-favicon" id="fav_${tabId}">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="#FF7626"><circle cx="12" cy="12" r="10"/></svg>
      </div>
      <span class="tab-title" id="title_${tabId}">${tab.title}</span>
      <div class="tab-audio-icon" id="audio_${tabId}" title="Mute/Unmute audio">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
      </div>
      <button class="tab-close-btn" id="close_${tabId}" title="Close tab">&times;</button>
    `;

    // Tab click events
    tabEl.addEventListener('click', (e) => {
      if (e.target.closest('.tab-close-btn')) return;
      if (e.target.closest('.tab-audio-icon')) {
        this.toggleMute(tabId);
        return;
      }
      this.activateTab(tabId);
    });

    // Middle click closes tab
    tabEl.addEventListener('auxclick', (e) => {
      if (e.button === 1) {
        e.preventDefault();
        this.closeTab(tabId);
      }
    });

    // Close button
    tabEl.querySelector('.tab-close-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTab(tabId);
    });

    this.tabStrip.appendChild(tabEl);
    tab.tabEl = tabEl;
    this.tabs.push(tab);

    // 4. Attach Webview Event Listeners
    this.setupWebviewListeners(tab);

    if (activate) {
      this.activateTab(tabId);
    }

    return tab;
  }

  setupWebviewListeners(tab) {
    const wv = tab.webview;

    wv.addEventListener('did-start-loading', () => {
      tab.isLoading = true;
      if (tab.id === this.activeTabId) {
        document.getElementById('reloadSvg').classList.add('spinning');
      }
    });

    wv.addEventListener('did-stop-loading', () => {
      tab.isLoading = false;
      if (tab.id === this.activeTabId) {
        document.getElementById('reloadSvg').classList.remove('spinning');
        this.updateNavButtons();
      }
    });

    wv.addEventListener('did-navigate', (e) => {
      tab.url = e.url;
      // Record in browsing history if not internal page
      if (window.braveAPI && window.braveAPI.addHistory && !tab.url.startsWith('brave://') && !tab.url.startsWith('about:')) {
        window.braveAPI.addHistory({ url: tab.url, title: tab.title, favicon: tab.favicon });
      }

      if (tab.id === this.activeTabId) {
        this.notifyTabUpdated(tab);
      }
    });

    wv.addEventListener('did-navigate-in-page', (e) => {
      tab.url = e.url;
      if (tab.id === this.activeTabId) {
        this.notifyTabUpdated(tab);
      }
    });

    wv.addEventListener('page-title-updated', (e) => {
      tab.title = e.title || tab.url;
      const titleEl = document.getElementById(`title_${tab.id}`);
      if (titleEl) {
        titleEl.textContent = tab.title;
        titleEl.title = tab.title;
      }
    });

    wv.addEventListener('page-favicon-updated', (e) => {
      if (e.favicons && e.favicons.length > 0) {
        tab.favicon = e.favicons[0];
        const favEl = document.getElementById(`fav_${tab.id}`);
        if (favEl) {
          favEl.innerHTML = `<img src="${tab.favicon}" onerror="this.src=''"/>`;
        }
      }
    });

    wv.addEventListener('new-window', (e) => {
      e.preventDefault();
      this.createTab(e.url, true);
    });

    wv.addEventListener('media-started-playing', () => {
      tab.isAudioPlaying = true;
      tab.tabEl.classList.add('audio-playing');
    });

    wv.addEventListener('media-paused', () => {
      tab.isAudioPlaying = false;
      tab.tabEl.classList.remove('audio-playing');
    });
  }

  activateTab(tabId) {
    if (this.activeTabId === tabId) return;

    this.tabs.forEach(t => {
      if (t.id === tabId) {
        t.tabEl.classList.add('active');
        t.webview.classList.add('active');
      } else {
        t.tabEl.classList.remove('active');
        t.webview.classList.remove('active');
      }
    });

    this.activeTabId = tabId;
    const active = this.getActiveTab();
    if (active) {
      this.notifyTabUpdated(active);
      this.updateNavButtons();
    }
  }

  closeTab(tabId) {
    const index = this.tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;

    const tab = this.tabs[index];

    // Remove DOM elements
    if (tab.tabEl) tab.tabEl.remove();
    if (tab.webview) tab.webview.remove();

    // Forgetful Browsing: purge storage if enabled for this domain
    try {
      if (tab.url && !tab.url.startsWith('brave://')) {
        const u = new URL(tab.url);
        const host = u.hostname;
        if (window.braveAPI && window.braveAPI.getDomainShields) {
          window.braveAPI.getDomainShields(host).then(cfg => {
            if (cfg && cfg.forgetOnClose && window.braveAPI.forgetDomain) {
              window.braveAPI.forgetDomain(host);
            }
          });
        }
      }
    } catch (e) {}

    this.tabs.splice(index, 1);

    // If we closed the active tab, switch to adjacent
    if (this.activeTabId === tabId) {
      if (this.tabs.length > 0) {
        const nextIndex = Math.min(index, this.tabs.length - 1);
        this.activateTab(this.tabs[nextIndex].id);
      } else {
        // No tabs left -> open new tab
        this.createTab('brave://newtab', true);
      }
    }
  }

  duplicateTab(tabId) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab) {
      this.createTab(tab.url, true);
    }
  }

  toggleMute(tabId) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab || !tab.webview) return;
    tab.isMuted = !tab.isMuted;
    tab.webview.setAudioMuted(tab.isMuted);
    const audioEl = document.getElementById(`audio_${tabId}`);
    if (audioEl) {
      audioEl.style.opacity = tab.isMuted ? '0.4' : '1';
    }
  }

  updateNavButtons() {
    const active = this.getActiveTab();
    const backBtn = document.getElementById('backBtn');
    const forwardBtn = document.getElementById('forwardBtn');

    if (!active || !active.webview) {
      if (backBtn) backBtn.disabled = true;
      if (forwardBtn) forwardBtn.disabled = true;
      return;
    }

    try {
      if (backBtn) backBtn.disabled = !active.webview.canGoBack();
      if (forwardBtn) forwardBtn.disabled = !active.webview.canGoForward();
    } catch (e) {
      // WebView not ready yet
    }
  }

  notifyTabUpdated(tab) {
    this.onActiveTabChangeCallbacks.forEach(cb => cb(tab));
  }
}

const tabManager = new TabManager();
window.tabManager = tabManager;
