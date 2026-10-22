document.addEventListener('DOMContentLoaded', () => {
  const downloadsBody = document.getElementById('downloadsBody');
  const clearDownloadsBtn = document.getElementById('clearDownloadsBtn');

  let downloads = [
    { id: 'dl_1', name: 'BraveBrowserStandaloneSetup.exe', size: '104.2 MB', date: 'Yesterday', status: 'Completed' },
    { id: 'dl_2', name: 'privacy_whitepaper_2026.pdf', size: '3.8 MB', date: 'Oct 18, 2026', status: 'Completed' },
    { id: 'dl_3', name: 'crypto_wallet_backup.json', size: '42 KB', date: 'Oct 10, 2026', status: 'Completed' }
  ];

  function renderDownloads() {
    downloadsBody.innerHTML = '';
    if (downloads.length === 0) {
      downloadsBody.innerHTML = '<p style="text-align: center; color: #8C92A4; margin-top: 60px;">No downloads yet.</p>';
      return;
    }

    downloads.forEach(dl => {
      const row = document.createElement('div');
      row.className = 'download-item';
      row.innerHTML = `
        <div class="dl-file-info">
          <h4>${dl.name}</h4>
          <span>${dl.size} • ${dl.date}</span>
        </div>
        <span class="dl-status-badge">${dl.status}</span>
      `;
      downloadsBody.appendChild(row);
    });
  }

  renderDownloads();

  clearDownloadsBtn.addEventListener('click', () => {
    downloads = [];
    renderDownloads();
  });

  if (window.braveAPI && window.braveAPI.onDownloadProgress) {
    window.braveAPI.onDownloadProgress((data) => {
      const existing = downloads.find(d => d.name === data.fileName);
      if (existing) {
        existing.status = data.state === 'completed' ? 'Completed' : `${data.percent}%`;
      } else {
        downloads.unshift({
          id: 'dl_' + Date.now(),
          name: data.fileName,
          size: `${Math.round(data.total / 1024)} KB`,
          date: 'Just now',
          status: `${data.percent}%`
        });
      }
      renderDownloads();
    });
  }
});
