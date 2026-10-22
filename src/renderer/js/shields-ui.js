/**
 * ShieldsUI - Controls Brave Shields popover, toggles, statistics, and blocked items list
 */

class ShieldsUI {
  constructor() {
    this.shieldsBtn = document.getElementById('shieldsBtn');
    this.shieldsPopover = document.getElementById('shieldsPopover');
    this.shieldsCountPill = document.getElementById('shieldsCountPill');
    this.shieldsCurrentDomain = document.getElementById('shieldsCurrentDomain');
    this.masterShieldsToggle = document.getElementById('masterShieldsToggle');
    this.siteBlockedCount = document.getElementById('siteBlockedCount');

    // Granular toggles
    this.blockTrackersToggle = document.getElementById('blockTrackersToggle');
    this.upgradeHttpsToggle = document.getElementById('upgradeHttpsToggle');
    this.blockScriptsToggle = document.getElementById('blockScriptsToggle');
    this.fingerprintSelect = document.getElementById('fingerprintSelect');
    this.forgetSiteToggle = document.getElementById('forgetSiteToggle');
    this.blockCookieNoticesToggle = document.getElementById('blockCookieNoticesToggle');

    // Blocked list drawer
    this.blockedItemsDrawer = document.getElementById('blockedItemsDrawer');
    this.toggleBlockedListBtn = document.getElementById('toggleBlockedListBtn');
    this.blockedItemsList = document.getElementById('blockedItemsList');

    this.openFullShieldsSettingsBtn = document.getElementById('openFullShieldsSettingsBtn');

    this.currentDomain = '';
    this.setupListeners();
  }

  setupListeners() {
    // Toggle popover on lion click
    this.shieldsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePopover();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#shieldsPopover') && !e.target.closest('#shieldsBtn')) {
        this.closePopover();
      }
    });

    // Master Shields toggle
    this.masterShieldsToggle.addEventListener('change', async (e) => {
      if (!this.currentDomain) return;
      const enabled = e.target.checked;
      if (window.braveAPI && window.braveAPI.setDomainShields) {
        await window.braveAPI.setDomainShields(this.currentDomain, { enabled });
      }
      this.reloadCurrentTab();
    });

    // Granular toggles
    this.blockTrackersToggle.addEventListener('change', (e) => {
      this.saveDomainSetting({ blockTrackers: e.target.checked });
    });

    this.upgradeHttpsToggle.addEventListener('change', (e) => {
      this.saveDomainSetting({ upgradeHttps: e.target.checked });
    });

    this.blockScriptsToggle.addEventListener('change', (e) => {
      this.saveDomainSetting({ blockScripts: e.target.checked });
      this.reloadCurrentTab();
    });

    this.fingerprintSelect.addEventListener('change', (e) => {
      this.saveDomainSetting({ fingerprintingProtection: e.target.value });
    });

    if (this.forgetSiteToggle) {
      this.forgetSiteToggle.addEventListener('change', (e) => {
        this.saveDomainSetting({ forgetOnClose: e.target.checked });
      });
    }

    if (this.blockCookieNoticesToggle) {
      this.blockCookieNoticesToggle.addEventListener('change', (e) => {
        this.saveDomainSetting({ blockCookieNotices: e.target.checked });
      });
    }

    // Blocked drawer toggle
    this.toggleBlockedListBtn.addEventListener('click', () => {
      this.blockedItemsDrawer.classList.toggle('expanded');
    });

    // Open full shields settings page in new tab
    this.openFullShieldsSettingsBtn.addEventListener('click', () => {
      this.closePopover();
      window.tabManager.createTab('brave://shields', true);
    });

    // Tab change update
    window.tabManager.onActiveTabChange((tab) => {
      this.updateForTab(tab);
    });

    // Live block event from main process
    if (window.braveAPI && window.braveAPI.onShieldsUpdated) {
      window.braveAPI.onShieldsUpdated((data) => {
        const active = window.tabManager.getActiveTab();
        if (active) {
          active.blockedCount = data.stats.count || 0;
          active.blockedItems = data.stats.blockedItems || [];
          this.shieldsCountPill.textContent = active.blockedCount;
          this.siteBlockedCount.textContent = active.blockedCount;
          this.renderBlockedList(active.blockedItems);
        }
      });
    }
  }

  togglePopover() {
    this.shieldsPopover.classList.toggle('open');
    if (this.shieldsPopover.classList.contains('open')) {
      const active = window.tabManager.getActiveTab();
      if (active) this.updateForTab(active);
    }
  }

  closePopover() {
    this.shieldsPopover.classList.remove('open');
  }

  extractHostname(url) {
    try {
      if (url.startsWith('brave://') || url.startsWith('about:')) return 'Brave Core';
      const u = new URL(url);
      return u.hostname;
    } catch {
      return '';
    }
  }

  async updateForTab(tab) {
    if (!tab) return;
    this.currentDomain = this.extractHostname(tab.url);
    this.shieldsCurrentDomain.textContent = this.currentDomain || 'New Tab';

    // Update badge pill
    const count = tab.blockedCount || 0;
    this.shieldsCountPill.textContent = count;
    this.siteBlockedCount.textContent = count;

    // Render blocked items
    this.renderBlockedList(tab.blockedItems || []);

    // Load domain rules
    if (this.currentDomain && !tab.url.startsWith('brave://') && window.braveAPI && window.braveAPI.getDomainShields) {
      const config = await window.braveAPI.getDomainShields(this.currentDomain);
      if (config) {
        this.masterShieldsToggle.checked = config.enabled !== false;
        this.blockTrackersToggle.checked = config.blockTrackers !== false;
        this.upgradeHttpsToggle.checked = config.upgradeHttps !== false;
        this.blockScriptsToggle.checked = config.blockScripts === true;
        if (this.forgetSiteToggle) {
          this.forgetSiteToggle.checked = config.forgetOnClose === true;
        }
        if (this.blockCookieNoticesToggle) {
          this.blockCookieNoticesToggle.checked = config.blockCookieNotices !== false;
        }
        if (config.fingerprintingProtection) {
          this.fingerprintSelect.value = config.fingerprintingProtection;
        }
      }
    }
  }

  async saveDomainSetting(partial) {
    if (!this.currentDomain || this.currentDomain === 'Brave Core') return;
    if (window.braveAPI && window.braveAPI.setDomainShields) {
      await window.braveAPI.setDomainShields(this.currentDomain, partial);
    }
  }

  reloadCurrentTab() {
    const active = window.tabManager.getActiveTab();
    if (active && active.webview) {
      active.webview.reload();
    }
  }

  renderBlockedList(items) {
    this.blockedItemsList.innerHTML = '';
    if (!items || items.length === 0) {
      this.blockedItemsList.innerHTML = '<span style="font-size: 11px; color: #8C92A4;">No trackers or ads blocked on this page.</span>';
      return;
    }

    items.slice(0, 30).forEach(item => {
      const row = document.createElement('div');
      row.className = 'blocked-item-entry';
      row.innerHTML = `
        <span class="blocked-host" title="${item.url}">${item.host || item.url}</span>
        <span class="blocked-type-tag">${item.type || 'ad'}</span>
      `;
      this.blockedItemsList.appendChild(row);
    });
  }
}

window.ShieldsUI = ShieldsUI;
