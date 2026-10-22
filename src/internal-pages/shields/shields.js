document.addEventListener('DOMContentLoaded', async () => {
  const filterRulesInput = document.getElementById('filterRulesInput');
  const saveFiltersBtn = document.getElementById('saveFiltersBtn');
  const filterStatusMsg = document.getElementById('filterStatusMsg');

  // Load existing rules
  if (window.braveAPI && window.braveAPI.getCustomFilters) {
    try {
      const rules = await window.braveAPI.getCustomFilters();
      if (rules && rules.length > 0) {
        filterRulesInput.value = rules.join('\n');
      }
    } catch (e) {
      console.warn('Could not load custom filters:', e);
    }
  }

  saveFiltersBtn.addEventListener('click', async () => {
    const raw = filterRulesInput.value;
    const rules = raw.split('\n').map(r => r.trim()).filter(Boolean);

    if (window.braveAPI && window.braveAPI.saveCustomFilters) {
      await window.braveAPI.saveCustomFilters(rules);
    }

    filterStatusMsg.textContent = `Saved and applied ${rules.length} custom filter rules!`;
    setTimeout(() => {
      filterStatusMsg.textContent = '';
    }, 3500);
  });
});
