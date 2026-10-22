document.addEventListener('DOMContentLoaded', async () => {
  const bookmarksBody = document.getElementById('bookmarksBody');
  const bmSearch = document.getElementById('bmSearch');
  const addBookmarkBtn = document.getElementById('addBookmarkBtn');

  let bookmarksList = [];

  if (window.braveAPI && window.braveAPI.getBookmarks) {
    try {
      bookmarksList = await window.braveAPI.getBookmarks();
    } catch (e) {
      console.warn('Could not fetch bookmarks:', e);
    }
  }

  function renderBookmarks(filterText = '') {
    bookmarksBody.innerHTML = '';
    const filtered = (bookmarksList || []).filter(item => {
      const q = filterText.toLowerCase();
      return (item.title && item.title.toLowerCase().includes(q)) || (item.url && item.url.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      bookmarksBody.innerHTML = '<p style="text-align: center; color: #8C92A4; margin-top: 60px;">No bookmarks found.</p>';
      return;
    }

    filtered.forEach(bm => {
      const row = document.createElement('div');
      row.className = 'bm-item';
      row.innerHTML = `
        <div class="bm-left">
          <span class="bm-folder-badge">${bm.folder || 'Favorites'}</span>
          <div class="bm-info">
            <a href="${bm.url}">${bm.title || bm.url}</a>
            <span>${bm.url}</span>
          </div>
        </div>
        <button class="bm-delete-btn" title="Delete bookmark" data-id="${bm.id}">&times;</button>
      `;

      row.querySelector('.bm-delete-btn').addEventListener('click', async () => {
        if (window.braveAPI && window.braveAPI.removeBookmark) {
          await window.braveAPI.removeBookmark(bm.id);
        }
        bookmarksList = bookmarksList.filter(b => b.id !== bm.id);
        renderBookmarks(bmSearch.value);
      });

      bookmarksBody.appendChild(row);
    });
  }

  renderBookmarks();

  bmSearch.addEventListener('input', (e) => {
    renderBookmarks(e.target.value);
  });

  addBookmarkBtn.addEventListener('click', async () => {
    const url = prompt('Enter website URL to bookmark:');
    if (!url) return;
    const title = prompt('Enter bookmark title:', url.replace(/^https?:\/\//, '').split('/')[0]) || url;
    const folder = prompt('Folder (Favorites, Tech, Reading, Crypto):', 'Favorites') || 'Favorites';

    const newBm = { url, title, folder };
    if (window.braveAPI && window.braveAPI.addBookmark) {
      bookmarksList = await window.braveAPI.addBookmark(newBm);
    } else {
      bookmarksList.push({ id: 'bm_' + Date.now(), ...newBm });
    }
    renderBookmarks(bmSearch.value);
  });
});
