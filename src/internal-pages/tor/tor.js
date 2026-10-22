document.addEventListener('DOMContentLoaded', async () => {
  const circuitNodes = document.getElementById('circuitNodes');
  const newCircuitBtn = document.getElementById('newCircuitBtn');

  let circuitData = {
    connected: true,
    circuit: [
      { role: 'Client', ip: '192.168.1.105', country: 'This Computer', flag: '💻' },
      { role: 'Guard Relay', ip: '185.220.101.5', country: 'Germany (DE)', flag: '🇩🇪' },
      { role: 'Middle Relay', ip: '193.187.91.12', country: 'Iceland (IS)', flag: '🇮🇸' },
      { role: 'Exit Node', ip: '178.17.170.89', country: 'Netherlands (NL)', flag: '🇳🇱' }
    ]
  };

  if (window.braveAPI && window.braveAPI.getTorCircuit) {
    try {
      const data = await window.braveAPI.getTorCircuit();
      if (data) circuitData = data;
    } catch (e) {
      console.warn('Could not fetch Tor circuit:', e);
    }
  }

  function renderCircuit() {
    circuitNodes.innerHTML = '';
    const nodes = circuitData.circuit || [];

    nodes.forEach((node, i) => {
      const box = document.createElement('div');
      box.className = 'circuit-node-box';
      box.innerHTML = `
        <span class="node-role">${node.role}</span>
        <span class="node-country">${node.flag || ''} ${node.country}</span>
        <span class="node-ip">${node.ip}</span>
      `;
      circuitNodes.appendChild(box);

      if (i < nodes.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'circuit-arrow';
        arrow.textContent = '➔';
        circuitNodes.appendChild(arrow);
      }
    });
  }

  renderCircuit();

  newCircuitBtn.addEventListener('click', async () => {
    newCircuitBtn.style.opacity = '0.5';
    newCircuitBtn.textContent = 'Building circuit...';

    if (window.braveAPI && window.braveAPI.newTorCircuit) {
      circuitData = await window.braveAPI.newTorCircuit();
    } else {
      // Rotate circuit simulation
      const relays = [
        { role: 'Guard Relay', ip: '198.51.100.42', country: 'Switzerland (CH)', flag: '🇨🇭' },
        { role: 'Middle Relay', ip: '109.70.100.25', country: 'Austria (AT)', flag: '🇦🇹' },
        { role: 'Exit Node', ip: '185.220.102.7', country: 'Finland (FI)', flag: '🇫🇮' }
      ];
      circuitData.circuit = [
        { role: 'Client', ip: '127.0.0.1', country: 'This Computer', flag: '💻' },
        ...relays
      ];
    }

    setTimeout(() => {
      renderCircuit();
      newCircuitBtn.style.opacity = '1';
      newCircuitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        New Tor Circuit
      `;
    }, 400);
  });
});
