document.addEventListener('DOMContentLoaded', async () => {
  const accountPill = document.getElementById('accountPill');
  const accountAddr = document.getElementById('accountAddr');
  const portfolioTotal = document.getElementById('portfolioTotal');
  const tokenList = document.getElementById('tokenList');
  const nftsGrid = document.getElementById('nftsGrid');
  const txList = document.getElementById('txList');
  const toast = document.getElementById('toast');

  // Modals
  const sendModal = document.getElementById('sendModal');
  const receiveModal = document.getElementById('receiveModal');
  const swapModal = document.getElementById('swapModal');

  const openSendModalBtn = document.getElementById('openSendModalBtn');
  const openReceiveModalBtn = document.getElementById('openReceiveModalBtn');
  const openSwapModalBtn = document.getElementById('openSwapModalBtn');

  const closeSendBtn = document.getElementById('closeSendBtn');
  const closeReceiveBtn = document.getElementById('closeReceiveBtn');
  const closeSwapBtn = document.getElementById('closeSwapBtn');

  const confirmSendBtn = document.getElementById('confirmSendBtn');
  const confirmSwapBtn = document.getElementById('confirmSwapBtn');
  const copyFullAddrBtn = document.getElementById('copyFullAddrBtn');

  // Tab switching
  const tabLinks = document.querySelectorAll('.tab-link');
  const walletPanels = document.querySelectorAll('.wallet-panel');

  tabLinks.forEach(link => {
    link.addEventListener('click', () => {
      const target = link.getAttribute('data-tab');
      tabLinks.forEach(l => l.classList.remove('active'));
      walletPanels.forEach(p => p.classList.remove('active'));

      link.classList.add('active');
      const activePanel = document.getElementById(`view-${target}`);
      if (activePanel) activePanel.classList.add('active');
    });
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // Load wallet data
  let walletData = {
    accounts: [
      {
        name: 'Main Brave Wallet',
        address: '0x71C...a829B',
        fullAddress: '0x71C63F54B06927395029D8481A07d885a42a829B',
        tokens: [
          { symbol: 'ETH', name: 'Ethereum', balance: '1.482', priceUsd: 3420.00, change24h: '+3.4%' },
          { symbol: 'BAT', name: 'Basic Attention Token', balance: '420.50', priceUsd: 0.28, change24h: '+8.1%' },
          { symbol: 'SOL', name: 'Solana', balance: '18.25', priceUsd: 178.50, change24h: '+5.6%' },
          { symbol: 'USDC', name: 'USD Coin', balance: '1,250.00', priceUsd: 1.00, change24h: '0.0%' }
        ],
        nfts: [
          { id: 'nft_1', name: 'Brave Lion Genesis #1042', collection: 'Brave Explorers', icon: '🦁' },
          { id: 'nft_2', name: 'Cyber Privacy Node #77', collection: 'Web3 Protectors', icon: '🛡️' }
        ]
      }
    ],
    transactions: [
      { id: 'tx_1', type: 'Received', symbol: 'BAT', amount: '+50.0 BAT', from: 'Brave Rewards Pool', date: '2 hours ago', status: 'Confirmed' },
      { id: 'tx_2', type: 'Sent', symbol: 'ETH', amount: '-0.15 ETH', to: '0x992...33F1', date: 'Yesterday', status: 'Confirmed' },
      { id: 'tx_3', type: 'Swap', symbol: 'USDC to BAT', amount: '100 USDC -> 357.14 BAT', date: '3 days ago', status: 'Confirmed' }
    ]
  };

  if (window.braveAPI && window.braveAPI.getWalletData) {
    try {
      const remote = await window.braveAPI.getWalletData();
      if (remote) walletData = remote;
    } catch (e) {
      console.warn('Could not fetch wallet data:', e);
    }
  }

  function renderWallet() {
    const account = walletData.accounts[0];
    accountAddr.textContent = account.address;

    // Calculate total USD
    let total = 0;
    tokenList.innerHTML = '';
    account.tokens.forEach(tok => {
      const fiatVal = (parseFloat(tok.balance.replace(/,/g, '')) * tok.priceUsd);
      total += fiatVal;

      const row = document.createElement('div');
      row.className = 'token-row';
      row.innerHTML = `
        <div class="token-left">
          <div class="token-symbol-badge">${tok.symbol}</div>
          <div class="token-name-col">
            <h4>${tok.name}</h4>
            <span>$${tok.priceUsd.toLocaleString()} (${tok.change24h})</span>
          </div>
        </div>
        <div class="token-right">
          <div class="token-balance">${tok.balance} ${tok.symbol}</div>
          <div class="token-fiat">$${fiatVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      `;
      tokenList.appendChild(row);
    });

    portfolioTotal.textContent = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // NFTs
    nftsGrid.innerHTML = '';
    (account.nfts || []).forEach(nft => {
      const card = document.createElement('div');
      card.className = 'nft-card';
      card.innerHTML = `
        <div class="nft-image-box">${nft.icon || '💎'}</div>
        <div class="nft-meta">
          <h4>${nft.name}</h4>
          <span>${nft.collection}</span>
        </div>
      `;
      nftsGrid.appendChild(card);
    });

    // Transactions
    txList.innerHTML = '';
    (walletData.transactions || []).forEach(tx => {
      const row = document.createElement('div');
      row.className = 'tx-row';
      row.innerHTML = `
        <div>
          <span class="tx-type-tag ${tx.type}">${tx.type}</span>
          <h4>${tx.amount}</h4>
          <span style="font-size: 12px; color: #8C92A4;">${tx.symbol} • ${tx.date || 'Recent'}</span>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 13px; color: #36B37E; font-weight: 600;">${tx.status}</span>
        </div>
      `;
      txList.appendChild(row);
    });
  }

  renderWallet();

  // Copy address handlers
  function copyAddress() {
    const full = walletData.accounts[0].fullAddress || walletData.accounts[0].address;
    navigator.clipboard.writeText(full);
    showToast('Address copied to clipboard!');
  }

  accountPill.addEventListener('click', copyAddress);
  copyFullAddrBtn.addEventListener('click', copyAddress);

  // Modal open/close
  openSendModalBtn.addEventListener('click', () => sendModal.classList.add('open'));
  closeSendBtn.addEventListener('click', () => sendModal.classList.remove('open'));

  openReceiveModalBtn.addEventListener('click', () => receiveModal.classList.add('open'));
  closeReceiveBtn.addEventListener('click', () => receiveModal.classList.remove('open'));

  openSwapModalBtn.addEventListener('click', () => swapModal.classList.add('open'));
  closeSwapBtn.addEventListener('click', () => swapModal.classList.remove('open'));

  // Confirm Send
  confirmSendBtn.addEventListener('click', () => {
    const to = document.getElementById('sendToAddr').value;
    const amount = document.getElementById('sendAmount').value;
    const asset = document.getElementById('sendAssetSelect').value;

    if (!to || !amount) {
      alert('Please enter a recipient address and amount');
      return;
    }

    walletData.transactions.unshift({
      id: 'tx_' + Date.now(),
      type: 'Sent',
      symbol: asset,
      amount: `-${amount} ${asset}`,
      date: 'Just now',
      status: 'Confirmed'
    });

    sendModal.classList.remove('open');
    renderWallet();
    showToast(`Sent ${amount} ${asset} successfully!`);
  });

  // Confirm Swap
  confirmSwapBtn.addEventListener('click', async () => {
    const fromAmount = document.getElementById('swapFromAmount').value;
    const fromSymbol = document.getElementById('swapFromToken').value;
    const toSymbol = document.getElementById('swapToToken').value;
    const toAmount = document.getElementById('swapToAmount').value;

    if (window.braveAPI && window.braveAPI.swapTokens) {
      const updated = await window.braveAPI.swapTokens({ fromSymbol, fromAmount, toSymbol, toAmount });
      if (updated) walletData = updated;
    } else {
      walletData.transactions.unshift({
        id: 'tx_' + Date.now(),
        type: 'Swap',
        symbol: `${fromSymbol} to ${toSymbol}`,
        amount: `${fromAmount} ${fromSymbol} -> ${toAmount} ${toSymbol}`,
        date: 'Just now',
        status: 'Confirmed'
      });
    }

    swapModal.classList.remove('open');
    renderWallet();
    showToast(`Swapped ${fromAmount} ${fromSymbol} for ${toAmount} ${toSymbol}!`);
  });
});
