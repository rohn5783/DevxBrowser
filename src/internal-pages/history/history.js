document.addEventListener('DOMContentLoaded', async () => {
  const historyBody = document.getElementById('historyBody');
  const historySearch = document.getElementById('historySearch');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  let historyList = [];

  if (window.braveAPI && window.braveAPI.getHistory) {
    try {
      historyList = await window.braveAPI.getHistory();
    } catch (e) {
      console.warn('Could not fetch history:', e);
    }
  }

  function renderHistory(filterText = '') {
    historyBody.innerHTML = '';
    const filtered = (historyList || []).filter(item => {
      const q = filterText.toLowerCase();
      return (item.title && item.title.toLowerCase().includes(q)) || (item.url && item.url.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      historyBody.innerHTML = '<p style="text-align: center; color: #8C92A4; margin-top: 60px;">No browsing history found.</p>';
      return;
    }

    // Group by date
    const groups = {};
    filtered.forEach(item => {
      const dateStr = new Date(item.visitTime || Date.now()).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(item);
    });

    Object.keys(groups).forEach(dateHeader => {
      const card = document.createElement('div');
      card.className = 'history-card';

      const h = document.createElement('div');
      h.className = 'history-date-header';
      h.textContent = dateHeader;
      card.appendChild(h);

      groups[dateHeader].forEach(item => {
        const row = document.createElement('div');
        row.className = 'history-item';
        const timeStr = new Date(item.visitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        row.innerHTML = `
          <div class="history-left">
            <span class="history-time">${timeStr}</span>
            <div class="history-title-url">
              <a href="${item.url}">${item.title || item.url}</a>
              <span>${item.url}</span>
            </div>
          </div>
          <button class="delete-item-btn" title="Remove from history" data-id="${item.id}">&times;</button>
        `;

        row.querySelector('.delete-item-btn').addEventListener('click', async () => {
          if (window.braveAPI && window.braveAPI.removeHistoryItem) {
            await window.braveAPI.removeHistoryItem(item.id);
          }
          historyList = historyList.filter(h => h.id !== item.id);
          renderHistory(historySearch.value);
        });

        card.appendChild(row);
      });

      historyBody.appendChild(card);
    });
  }

  renderHistory();

  historySearch.addEventListener('input', (e) => {
    renderHistory(e.target.value);
  });

  clearHistoryBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear your entire browsing history?')) {
      if (window.braveAPI && window.braveAPI.clearHistory) {
        await window.braveAPI.clearHistory();
      }
      historyList = [];
      renderHistory();
    }
  });
});
