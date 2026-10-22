document.addEventListener('DOMContentLoaded', async () => {
  // Navigation tabs
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      navBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = document.getElementById(`tab-${targetTab}`);
      if (pane) pane.classList.add('active');
    });
  });

  // Check URL query parameters (e.g. ?tab=shields or ?tab=appearance)
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTab = urlParams.get('tab');
  if (requestedTab) {
    const matchingBtn = document.querySelector(`.nav-btn[data-tab="${requestedTab}"]`);
    if (matchingBtn) matchingBtn.click();
  }

  // Load existing settings
  if (window.braveAPI && window.braveAPI.getSettings) {
    try {
      const settings = await window.braveAPI.getSettings();
      if (settings) {
        if (settings.shields) {
          const httpsEverywhere = document.getElementById('httpsEverywhere');
          if (httpsEverywhere) httpsEverywhere.checked = settings.shields.upgradeHttps !== false;

          const blockCookies = document.getElementById('blockCookies');
          if (blockCookies) blockCookies.checked = settings.shields.blockThirdPartyCookies !== false;

          const fingerprintingLevel = document.getElementById('fingerprintingLevel');
          if (fingerprintingLevel && settings.shields.fingerprintingProtection) {
            fingerprintingLevel.value = settings.shields.fingerprintingProtection;
          }
        }

        if (settings.appearance) {
          const themeSelect = document.getElementById('themeSelect');
          if (themeSelect && settings.appearance.theme) themeSelect.value = settings.appearance.theme;

          const tabLayoutSelect = document.getElementById('tabLayoutSelect');
          if (tabLayoutSelect && settings.appearance.tabLayout) tabLayoutSelect.value = settings.appearance.tabLayout;

          const bookmarksBarToggle = document.getElementById('bookmarksBarToggle');
          if (bookmarksBarToggle) bookmarksBarToggle.checked = settings.appearance.showBookmarksBar !== false;
        }

        if (settings.search && settings.search.defaultEngine) {
          const defaultSearchSelect = document.getElementById('defaultSearchSelect');
          if (defaultSearchSelect) defaultSearchSelect.value = settings.search.defaultEngine;
        }

        if (settings.leo && settings.leo.defaultModel) {
          const leoModelSelect = document.getElementById('leoModelSelect');
          if (leoModelSelect) leoModelSelect.value = settings.leo.defaultModel;
        }
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
    }
  }

  // Helper to persist updates
  async function saveSettingUpdate(partial) {
    if (window.braveAPI && window.braveAPI.updateSettings) {
      await window.braveAPI.updateSettings(partial);
    }
  }

  // Event Listeners for Shields
  document.getElementById('httpsEverywhere')?.addEventListener('change', (e) => {
    saveSettingUpdate({ shields: { upgradeHttps: e.target.checked } });
  });

  document.getElementById('fingerprintingLevel')?.addEventListener('change', (e) => {
    saveSettingUpdate({ shields: { fingerprintingProtection: e.target.value } });
  });

  document.getElementById('blockCookies')?.addEventListener('change', (e) => {
    saveSettingUpdate({ shields: { blockThirdPartyCookies: e.target.checked } });
  });

  // Event Listeners for Appearance
  document.getElementById('themeSelect')?.addEventListener('change', (e) => {
    saveSettingUpdate({ appearance: { theme: e.target.value } });
  });

  document.getElementById('tabLayoutSelect')?.addEventListener('change', (e) => {
    saveSettingUpdate({ appearance: { tabLayout: e.target.value } });
  });

  document.getElementById('bookmarksBarToggle')?.addEventListener('change', (e) => {
    saveSettingUpdate({ appearance: { showBookmarksBar: e.target.checked } });
  });

  // Event Listener for Search
  document.getElementById('defaultSearchSelect')?.addEventListener('change', (e) => {
    saveSettingUpdate({ search: { defaultEngine: e.target.value } });
  });

  // Event Listener for Leo
  document.getElementById('leoModelSelect')?.addEventListener('change', (e) => {
    saveSettingUpdate({ leo: { defaultModel: e.target.value } });
  });

  // Clear Browsing Data
  const clearDataBtn = document.getElementById('clearDataBtn');
  const clearStatusMsg = document.getElementById('clearStatusMsg');
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', async () => {
      const clearHistory = document.getElementById('clearHistory').checked;
      if (clearHistory && window.braveAPI && window.braveAPI.clearHistory) {
        await window.braveAPI.clearHistory();
      }
      clearStatusMsg.textContent = 'Browsing data cleared successfully!';
      setTimeout(() => {
        clearStatusMsg.textContent = '';
      }, 3500);
    });
  }
});
