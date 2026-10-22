document.addEventListener('DOMContentLoaded', async () => {
  const batBalanceEl = document.getElementById('batBalance');
  const batFiatValEl = document.getElementById('batFiatVal');
  const attentionScoreEl = document.getElementById('attentionScore');
  const claimRewardsBtn = document.getElementById('claimRewardsBtn');
  const tipsTableBox = document.getElementById('tipsTableBox');
  const rewardsOptIn = document.getElementById('rewardsOptIn');
  const toast = document.getElementById('toast');

  let rewards = {
    optIn: true,
    batBalance: 14.85,
    batUsdRate: 0.28,
    estimatedEarnings: 3.40,
    attentionScore: 92,
    tips: [
      { id: 'tip_1', creator: 'Wikipedia Foundation', url: 'https://wikipedia.org', batAmount: 2.0, date: 'Oct 14, 2026' },
      { id: 'tip_2', creator: 'The Electronic Frontier Foundation', url: 'https://eff.org', batAmount: 5.0, date: 'Oct 02, 2026' }
    ]
  };

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  if (window.braveAPI && window.braveAPI.getRewardsData) {
    try {
      const res = await window.braveAPI.getRewardsData();
      if (res) rewards = res;
    } catch (e) {
      console.warn('Could not fetch rewards:', e);
    }
  }

  function renderRewards() {
    batBalanceEl.textContent = Number(rewards.batBalance).toFixed(2);
    const fiat = (rewards.batBalance * (rewards.batUsdRate || 0.28)).toFixed(2);
    batFiatValEl.textContent = `≈ $${fiat} USD`;
    attentionScoreEl.textContent = `${rewards.attentionScore || 92}%`;

    // Render tips table
    tipsTableBox.innerHTML = '';
    const tipsList = rewards.tips || [];
    if (tipsList.length === 0) {
      tipsTableBox.innerHTML = '<p style="color: #8C92A4; font-size: 13px;">No creator tips sent yet.</p>';
      return;
    }

    tipsList.forEach(tip => {
      const row = document.createElement('div');
      row.className = 'tip-item';
      row.innerHTML = `
        <div>
          <div class="tip-creator">${tip.creator}</div>
          <div class="tip-date">${typeof tip.date === 'number' ? new Date(tip.date).toLocaleDateString() : tip.date}</div>
        </div>
        <div class="tip-amount">-${tip.batAmount} BAT</div>
      `;
      tipsTableBox.appendChild(row);
    });
  }

  renderRewards();

  // Claim rewards button
  claimRewardsBtn.addEventListener('click', () => {
    rewards.batBalance = +(rewards.batBalance + 2.50).toFixed(2);
    renderRewards();
    showToast('Claimed +2.50 BAT from Brave Rewards Pool!');
  });

  // Tipping buttons
  document.querySelectorAll('.tip-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const creator = btn.getAttribute('data-creator');
      const url = btn.getAttribute('data-url');
      const amountStr = prompt(`Enter BAT amount to tip ${creator}:`, '1.0');
      const amount = parseFloat(amountStr);

      if (!amount || amount <= 0) return;
      if (amount > rewards.batBalance) {
        alert('Insufficient BAT balance!');
        return;
      }

      if (window.braveAPI && window.braveAPI.sendTip) {
        const updated = await window.braveAPI.sendTip({ creator, url, amount });
        if (updated) rewards = updated;
      } else {
        rewards.batBalance = +(rewards.batBalance - amount).toFixed(2);
        rewards.tips.unshift({
          id: 'tip_' + Date.now(),
          creator,
          url,
          batAmount: amount,
          date: 'Just now'
        });
      }

      renderRewards();
      showToast(`Tipped ${amount} BAT to ${creator}! Thank you for supporting creators.`);
    });
  });
});
