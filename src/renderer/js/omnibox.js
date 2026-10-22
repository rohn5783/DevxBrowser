/**
 * Omnibox - Controls the URL input, search engine dispatcher, autocomplete suggestions, and security badge
 */

class OmniboxController {
  constructor() {
    this.input = document.getElementById('omniboxInput');
    this.suggestions = document.getElementById('omniboxSuggestions');
    this.securityBadge = document.getElementById('securityBadge');
    this.bookmarkBtn = document.getElementById('bookmarkBtn');
    this.starSvg = document.getElementById('starSvg');
    this.speedReaderBtn = document.getElementById('speedReaderBtn');
    this.copyCleanLinkBtn = document.getElementById('copyCleanLinkBtn');

    this.defaultSearchTemplate = 'https://search.brave.com/search?q=%s';
    this.setupListeners();
  }

  setupListeners() {
    // Input typing -> suggestions
    this.input.addEventListener('input', () => {
      this.handleInput(this.input.value.trim());
    });

    // Enter to navigate
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.submit(this.input.value.trim());
      } else if (e.key === 'Escape') {
        this.hideSuggestions();
        this.revertToCurrentTabUrl();
      }
    });

    // Select all on focus
    this.input.addEventListener('focus', () => {
      this.input.select();
      if (this.input.value.trim()) {
        this.handleInput(this.input.value.trim());
      }
    });

    // Click outside hides suggestions
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#omniboxWrapper')) {
        this.hideSuggestions();
      }
    });

    // Bookmark toggle button
    this.bookmarkBtn.addEventListener('click', () => {
      this.toggleBookmark();
    });

    // SpeedReader toggle
    if (this.speedReaderBtn) {
      this.speedReaderBtn.addEventListener('click', () => {
        window.tabManager.toggleSpeedReader();
      });
    }

    // Copy Clean Link (strips tracking tokens)
    if (this.copyCleanLinkBtn) {
      this.copyCleanLinkBtn.addEventListener('click', async () => {
        const active = window.tabManager.getActiveTab();
        if (!active || !active.url) return;

        let clean = active.url;
        if (window.braveAPI && window.braveAPI.cleanUrl) {
          clean = await window.braveAPI.cleanUrl(active.url);
        }
        await navigator.clipboard.writeText(clean);

        const originalSvg = this.copyCleanLinkBtn.innerHTML;
        this.copyCleanLinkBtn.innerHTML = `<span style="font-size: 11px; font-weight: bold; color: #36B37E;">✓</span>`;
        setTimeout(() => {
          this.copyCleanLinkBtn.innerHTML = originalSvg;
        }, 1800);
      });
    }

    // Listen to tab changes
    window.tabManager.onActiveTabChange((tab) => {
      this.updateForTab(tab);
    });
  }

  updateForTab(tab) {
    if (!tab) return;
    if (document.activeElement !== this.input) {
      this.input.value = tab.url.startsWith('brave://newtab') ? '' : tab.url;
      if (tab.url.startsWith('brave://newtab')) {
        this.input.placeholder = 'Search or enter URL...';
      }
    }
    this.updateSecurityBadge(tab.url);
    this.checkBookmarkStatus(tab.url);
  }

  updateSecurityBadge(url) {
    if (!url) return;
    if (url.startsWith('https://')) {
      this.securityBadge.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#36B37E" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
      this.securityBadge.title = 'Secure Connection (HTTPS)';
    } else if (url.startsWith('brave://tor')) {
      this.securityBadge.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#A742EB" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;
      this.securityBadge.title = 'Private Window with Tor';
    } else if (url.startsWith('brave://')) {
      this.securityBadge.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="#FF7626"><path d="M12 2L4 7V15C4 22.38 9.12 29.23 12 31C14.88 29.23 20 22.38 20 15V7L12 2Z"/></svg>`;
      this.securityBadge.title = 'Internal Brave Page';
    } else {
      this.securityBadge.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#FF5000" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
      this.securityBadge.title = 'Insecure Connection (HTTP)';
    }
  }

  async checkBookmarkStatus(url) {
    let isBm = false;
    if (window.braveAPI && window.braveAPI.isBookmarked) {
      isBm = await window.braveAPI.isBookmarked(url);
    }
    if (isBm) {
      this.bookmarkBtn.classList.add('active');
      this.starSvg.setAttribute('fill', '#FF7626');
      this.starSvg.setAttribute('stroke', '#FF7626');
    } else {
      this.bookmarkBtn.classList.remove('active');
      this.starSvg.setAttribute('fill', 'none');
      this.starSvg.setAttribute('stroke', 'currentColor');
    }
  }

  async toggleBookmark() {
    const active = window.tabManager.getActiveTab();
    if (!active) return;

    if (window.braveAPI) {
      const isBm = await window.braveAPI.isBookmarked(active.url);
      if (isBm) {
        await window.braveAPI.removeBookmark(active.url);
      } else {
        await window.braveAPI.addBookmark({
          url: active.url,
          title: active.title || active.url,
          folder: 'Favorites'
        });
      }
      this.checkBookmarkStatus(active.url);
      if (window.bookmarksBar) window.bookmarksBar.reload();
    }
  }

  revertToCurrentTabUrl() {
    const active = window.tabManager.getActiveTab();
    if (active) {
      this.input.value = active.url.startsWith('brave://newtab') ? '' : active.url;
    }
  }

  submit(val) {
    if (!val) return;
    this.hideSuggestions();

    const dest = this.resolveNavigationUrl(val);
    const active = window.tabManager.getActiveTab();

    if (active && active.webview) {
      active.webview.loadURL(dest);
    }
  }

  resolveNavigationUrl(val) {
    if (val.startsWith('brave://') || val.startsWith('about:') || val.startsWith('file://')) {
      return val;
    }

    // Check if valid URL or domain
    const isUrl = /^https?:\/\//i.test(val) || /^localhost(:[0-9]+)?/i.test(val) || (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(val) && !val.includes(' '));

    if (isUrl) {
      return val.includes('://') ? val : `https://${val}`;
    }

    // Default to search engine
    return this.defaultSearchTemplate.replace('%s', encodeURIComponent(val));
  }

  async handleInput(query) {
    if (!query) {
      this.hideSuggestions();
      return;
    }

    const items = [];

    // Search query item
    items.push({
      type: 'search',
      title: query,
      subtitle: 'Brave Search',
      url: this.defaultSearchTemplate.replace('%s', encodeURIComponent(query))
    });

    // If query looks like a domain, suggest direct navigation
    if (query.includes('.') && !query.includes(' ')) {
      const direct = query.includes('://') ? query : `https://${query}`;
      items.push({
        type: 'url',
        title: direct,
        subtitle: 'Visit Website',
        url: direct
      });
    }

    // Match bookmarks and history
    if (window.braveAPI) {
      try {
        const bookmarks = await window.braveAPI.getBookmarks();
        (bookmarks || []).forEach(bm => {
          if (bm.title.toLowerCase().includes(query.toLowerCase()) || bm.url.toLowerCase().includes(query.toLowerCase())) {
            items.push({
              type: 'bookmark',
              title: bm.title,
              subtitle: bm.url,
              url: bm.url
            });
          }
        });
      } catch (e) {}
    }

    this.renderSuggestions(items.slice(0, 6));
  }

  renderSuggestions(items) {
    if (items.length === 0) {
      this.hideSuggestions();
      return;
    }

    this.suggestions.innerHTML = '';
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'suggestion-item';

      let iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
      if (item.type === 'bookmark') {
        iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" fill="#FF7626"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
      } else if (item.type === 'url') {
        iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
      }

      row.innerHTML = `
        <div class="suggestion-icon">${iconSvg}</div>
        <div class="suggestion-text">
          <span class="suggestion-title">${item.title}</span>
          <span class="suggestion-url">${item.subtitle}</span>
        </div>
        <span class="suggestion-tag">${item.type}</span>
      `;

      row.addEventListener('click', () => {
        const active = window.tabManager.getActiveTab();
        if (active && active.webview) {
          active.webview.loadURL(item.url);
        }
        this.hideSuggestions();
      });

      this.suggestions.appendChild(row);
    });

    this.suggestions.classList.add('open');
  }

  hideSuggestions() {
    this.suggestions.classList.remove('open');
  }
}

window.OmniboxController = OmniboxController;
