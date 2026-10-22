/**
 * BookmarksBar - Manages quick bookmarks bar directly below the omnibox
 */

class BookmarksBar {
  constructor() {
    this.bar = document.getElementById('bookmarksBar');
    this.reload();
  }

  async reload() {
    if (!this.bar) return;
    this.bar.innerHTML = '';

    let bookmarks = [
      { id: '1', title: 'Brave Search', url: 'https://search.brave.com', letter: 'B' },
      { id: '2', title: 'GitHub', url: 'https://github.com', letter: 'G' },
      { id: '3', title: 'Wikipedia', url: 'https://wikipedia.org', letter: 'W' },
      { id: '4', title: 'Hacker News', url: 'https://news.ycombinator.com', letter: 'H' },
      { id: '5', title: 'CoinGecko', url: 'https://coingecko.com', letter: 'C' }
    ];

    if (window.braveAPI && window.braveAPI.getBookmarks) {
      try {
        const stored = await window.braveAPI.getBookmarks();
        if (stored && stored.length > 0) {
          bookmarks = stored;
        }
      } catch (e) {}
    }

    bookmarks.forEach(bm => {
      const chip = document.createElement('div');
      chip.className = 'bm-chip';
      const initial = (bm.title || bm.url).charAt(0).toUpperCase();

      chip.innerHTML = `
        <span class="bm-chip-icon">${initial}</span>
        <span>${bm.title || bm.url}</span>
      `;

      chip.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey) {
          window.tabManager.createTab(bm.url, true);
        } else {
          const active = window.tabManager.getActiveTab();
          if (active && active.webview) {
            active.webview.loadURL(bm.url);
          }
        }
      });

      chip.addEventListener('auxclick', (e) => {
        if (e.button === 1) {
          window.tabManager.createTab(bm.url, true);
        }
      });

      chip.addEventListener('contextmenu', async (e) => {
        e.preventDefault();
        if (confirm(`Remove bookmark "${bm.title}"?`)) {
          if (window.braveAPI && window.braveAPI.removeBookmark) {
            await window.braveAPI.removeBookmark(bm.id);
            this.reload();
          }
        }
      });

      this.bar.appendChild(chip);
    });
  }
}

window.BookmarksBar = BookmarksBar;
