document.addEventListener('DOMContentLoaded', async () => {
  const clockDisplay = document.getElementById('clockDisplay');
  const greetingDisplay = document.getElementById('greetingDisplay');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const topSitesGrid = document.getElementById('topSitesGrid');
  const adsBlockedCount = document.getElementById('adsBlockedCount');
  const bandwidthSaved = document.getElementById('bandwidthSaved');
  const timeSaved = document.getElementById('timeSaved');
  const newsGrid = document.getElementById('newsGrid');
  const refreshNewsBtn = document.getElementById('refreshNewsBtn');
  const nextWallpaperBtn = document.getElementById('nextWallpaperBtn');
  const customizeBtn = document.getElementById('customizeBtn');
  const customizeDrawer = document.getElementById('customizeDrawer');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const wallpaperInfo = document.getElementById('wallpaperInfo');

  // Wallpapers list (CSS linear/radial rich gradients & scenic artistic backdrops)
  const WALLPAPERS = [
    {
      name: 'Sierra Twilight Ridge',
      style: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)'
    },
    {
      name: 'Brave Nebula Deep Space',
      style: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%), linear-gradient(to top right, rgba(255, 118, 38, 0.25), transparent 70%)'
    },
    {
      name: 'Cyberpunk Tokyo Rain',
      style: 'linear-gradient(180deg, #130924 0%, #221338 50%, #0F172A 100%)'
    },
    {
      name: 'Nordic Aurora Borealis',
      style: 'linear-gradient(135deg, #0A192F 0%, #172A45 50%, #0D324D 100%)'
    },
    {
      name: 'Golden Hour Dune',
      style: 'linear-gradient(160deg, #2D142C 0%, #510A32 50%, #801336 100%)'
    }
  ];

  let currentWallpaperIndex = 0;

  function setWallpaper(index) {
    currentWallpaperIndex = index % WALLPAPERS.length;
    const wp = WALLPAPERS[currentWallpaperIndex];
    document.body.style.background = wp.style;
    if (wallpaperInfo) {
      wallpaperInfo.innerHTML = `<span class="photo-by">Wallpaper: ${wp.name}</span>`;
    }
  }

  setWallpaper(0);

  if (nextWallpaperBtn) {
    nextWallpaperBtn.addEventListener('click', () => {
      setWallpaper(currentWallpaperIndex + 1);
    });
  }

  // --- Clock & Greeting ---
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockDisplay.textContent = `${hours}:${minutes}`;

    const h = now.getHours();
    let greet = 'Good evening';
    if (h < 12) greet = 'Good morning';
    else if (h < 18) greet = 'Good afternoon';
    greetingDisplay.textContent = `${greet}, Explorer`;
  }

  setInterval(updateClock, 1000);
  updateClock();

  // --- Shields Statistics ---
  async function loadShieldsStats() {
    try {
      let stats = { totalAdsBlocked: 1420, totalTrackersBlocked: 865, totalBandwidthSavedBytes: 29500000, totalTimeSavedMs: 45000 };
      if (window.braveAPI && window.braveAPI.getShieldsStats) {
        const live = await window.braveAPI.getShieldsStats();
        if (live) stats = live;
      }
      const totalBlocked = (stats.totalAdsBlocked || 0) + (stats.totalTrackersBlocked || 0);
      adsBlockedCount.textContent = totalBlocked.toLocaleString();

      const mbSaved = ((stats.totalBandwidthSavedBytes || 0) / (1024 * 1024)).toFixed(1);
      bandwidthSaved.textContent = `${mbSaved} MB`;

      const secSaved = Math.round((stats.totalTimeSavedMs || 0) / 1000);
      timeSaved.textContent = secSaved > 60 ? `${(secSaved / 60).toFixed(1)} m` : `${secSaved} s`;
    } catch (e) {
      console.warn('Could not load shields stats:', e);
    }
  }

  loadShieldsStats();

  // --- Search Bar Navigation ---
  function handleSearch() {
    const val = searchInput.value.trim();
    if (!val) return;

    // Check if input is a URL
    const isUrl = /^https?:\/\//i.test(val) || /^brave:\/\//i.test(val) || /^localhost(:[0-9]+)?/i.test(val) || (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(val) && !val.includes(' '));

    if (isUrl) {
      const dest = val.includes('://') ? val : `https://${val}`;
      window.location.href = dest;
    } else {
      window.location.href = `https://search.brave.com/search?q=${encodeURIComponent(val)}`;
    }
  }

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  searchBtn.addEventListener('click', handleSearch);

  // --- Top Sites ---
  let topSites = [
    { title: 'Brave Search', url: 'https://search.brave.com', letter: 'B' },
    { title: 'GitHub', url: 'https://github.com', letter: 'G' },
    { title: 'Wikipedia', url: 'https://wikipedia.org', letter: 'W' },
    { title: 'YouTube', url: 'https://youtube.com', letter: 'Y' },
    { title: 'Reddit', url: 'https://reddit.com', letter: 'R' },
    { title: 'Hacker News', url: 'https://news.ycombinator.com', letter: 'H' },
    { title: 'CoinGecko', url: 'https://coingecko.com', letter: 'C' },
    { title: 'DuckDuckGo', url: 'https://duckduckgo.com', letter: 'D' }
  ];

  async function loadTopSites() {
    if (window.braveAPI && window.braveAPI.getTopSites) {
      const custom = await window.braveAPI.getTopSites();
      if (custom && custom.length > 0) {
        topSites = custom.map(s => ({
          ...s,
          letter: (s.title || s.url).charAt(0).toUpperCase()
        }));
      }
    }
    renderTopSites();
  }

  function renderTopSites() {
    topSitesGrid.innerHTML = '';
    topSites.forEach((site) => {
      const tile = document.createElement('a');
      tile.className = 'site-tile';
      tile.href = site.url;
      tile.innerHTML = `
        <div class="tile-icon-box">${site.letter || site.title.charAt(0)}</div>
        <span class="tile-title" title="${site.title}">${site.title}</span>
      `;
      topSitesGrid.appendChild(tile);
    });

    // Add Site button
    const addTile = document.createElement('div');
    addTile.className = 'site-tile add-site-tile';
    addTile.innerHTML = `
      <div class="tile-icon-box">+</div>
      <span class="tile-title">Add Site</span>
    `;
    addTile.addEventListener('click', () => {
      const url = prompt('Enter website URL (e.g. https://eff.org):');
      if (url) {
        const title = prompt('Enter site title:', url.replace(/^https?:\/\//, '').split('/')[0]) || url;
        topSites.push({ title, url, letter: title.charAt(0).toUpperCase() });
        if (window.braveAPI && window.braveAPI.saveTopSites) {
          window.braveAPI.saveTopSites(topSites);
        }
        renderTopSites();
      }
    });
    topSitesGrid.appendChild(addTile);
  }

  loadTopSites();

  // --- Brave News Feed ---
  const NEWS_ITEMS = [
    {
      source: 'Brave Research',
      tag: 'Privacy',
      time: '12m ago',
      title: 'Brave introduces next-gen AI shielding and tracker partition sandboxing',
      summary: 'New cryptographic protections isolate cross-site storage and completely nullify fingerprinting without breaking web apps.',
      url: 'https://brave.com'
    },
    {
      source: 'Hacker News',
      tag: 'Open Source',
      time: '34m ago',
      title: 'Decentralized Web Standards gaining critical browser adoption',
      summary: 'W3C working groups announce progressive enhancements for privacy-preserving verifiable credentials and local AI.',
      url: 'https://news.ycombinator.com'
    },
    {
      source: 'Ars Technica',
      tag: 'Security',
      time: '1h ago',
      title: 'Major ad networks caught attempting unpartitioned cookie leakage',
      summary: 'Security researchers document how aggressive tracker blocking saved millions of consumer devices from surveillance data brokers.',
      url: 'https://arstechnica.com'
    },
    {
      source: 'CoinDesk',
      tag: 'Web3',
      time: '2h ago',
      title: 'BAT ecosystem surpasses 100M active monthly reward payouts',
      summary: 'Creators across Wikipedia, YouTube, and GitHub receive direct privacy-focused microtips without intrusive advertising middlemen.',
      url: 'https://basicattentiontoken.org'
    }
  ];

  function renderNews() {
    newsGrid.innerHTML = '';
    NEWS_ITEMS.forEach(item => {
      const card = document.createElement('a');
      card.className = 'news-card';
      card.href = item.url;
      card.innerHTML = `
        <div class="news-card-meta">
          <span>${item.source} • ${item.tag}</span>
          <span>${item.time}</span>
        </div>
        <h3>${item.title}</h3>
        <p>${item.summary}</p>
      `;
      newsGrid.appendChild(card);
    });
  }

  renderNews();

  if (refreshNewsBtn) {
    refreshNewsBtn.addEventListener('click', () => {
      NEWS_ITEMS.reverse();
      renderNews();
    });
  }

  // --- Customize Drawer ---
  if (customizeBtn && customizeDrawer && closeDrawerBtn) {
    customizeBtn.addEventListener('click', () => {
      customizeDrawer.classList.toggle('open');
    });
    closeDrawerBtn.addEventListener('click', () => {
      customizeDrawer.classList.remove('open');
    });
  }

  // Toggle handlers
  const toggleStats = document.getElementById('toggleStats');
  const toggleClock = document.getElementById('toggleClock');
  const toggleTopSites = document.getElementById('toggleTopSites');
  const toggleNews = document.getElementById('toggleNews');

  if (toggleStats) {
    toggleStats.addEventListener('change', (e) => {
      document.getElementById('statsRow').style.display = e.target.checked ? 'flex' : 'none';
    });
  }
  if (toggleClock) {
    toggleClock.addEventListener('change', (e) => {
      document.getElementById('clockSection').style.display = e.target.checked ? 'block' : 'none';
    });
  }
  if (toggleTopSites) {
    toggleTopSites.addEventListener('change', (e) => {
      document.getElementById('topSitesGrid').style.display = e.target.checked ? 'flex' : 'none';
    });
  }
  if (toggleNews) {
    toggleNews.addEventListener('change', (e) => {
      document.getElementById('newsSection').style.display = e.target.checked ? 'block' : 'none';
    });
  }
});
