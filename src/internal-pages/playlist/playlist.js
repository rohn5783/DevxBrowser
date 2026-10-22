document.addEventListener('DOMContentLoaded', async () => {
  const playlistGrid = document.getElementById('playlistGrid');
  const addToPlaylistBtn = document.getElementById('addToPlaylistBtn');

  let items = [];

  if (window.braveAPI && window.braveAPI.getPlaylist) {
    try {
      items = await window.braveAPI.getPlaylist();
    } catch (e) {
      console.warn('Failed to load playlist:', e);
    }
  }

  function renderPlaylist() {
    playlistGrid.innerHTML = '';
    if (items.length === 0) {
      playlistGrid.innerHTML = '<p style="text-align: center; color: #8C92A4; margin-top: 50px;">Your playlist is empty. Save articles or media while browsing to read them offline.</p>';
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'playlist-card';
      card.innerHTML = `
        <div class="card-left">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <div class="card-info">
            <a href="${item.url}">${item.title}</a>
            <span>${item.url} • Estimated read: ${item.readTime || '3 min'}</span>
          </div>
        </div>
        <button class="card-delete-btn" title="Remove from playlist">&times;</button>
      `;

      card.querySelector('.card-delete-btn').addEventListener('click', async () => {
        if (window.braveAPI && window.braveAPI.removeFromPlaylist) {
          items = await window.braveAPI.removeFromPlaylist(item.id);
        } else {
          items = items.filter(i => i.id !== item.id);
        }
        renderPlaylist();
      });

      playlistGrid.appendChild(card);
    });
  }

  renderPlaylist();

  addToPlaylistBtn.addEventListener('click', async () => {
    const url = prompt('Enter article or media URL:');
    if (!url) return;
    const title = prompt('Enter title:', url.replace(/^https?:\/\//, '').split('/')[0]) || url;

    if (window.braveAPI && window.braveAPI.addToPlaylist) {
      items = await window.braveAPI.addToPlaylist({ url, title, readTime: '5 min' });
    } else {
      items.unshift({ id: 'pl_' + Date.now(), url, title, readTime: '5 min' });
    }
    renderPlaylist();
  });
});
