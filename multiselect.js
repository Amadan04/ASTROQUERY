export function createMultiSelect({ options, value, onChange, placeholder = 'Select...' }) {
  const container = document.createElement('div');
  container.className = 'multiselect-container';

  const filterInput = document.createElement('input');
  filterInput.type = 'text';
  filterInput.className = 'multiselect-filter';
  filterInput.placeholder = placeholder;

  const listContainer = document.createElement('div');
  listContainer.className = 'multiselect-list';

  function renderOptions(filter = '') {
    listContainer.innerHTML = '';
    const filtered = options.filter(opt =>
      opt.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
      listContainer.innerHTML = '<div class="multiselect-empty">No options found</div>';
      return;
    }

    filtered.forEach(option => {
      const label = document.createElement('label');
      label.className = 'multiselect-option';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = option;
      checkbox.checked = value.includes(option);

      checkbox.addEventListener('change', () => {
        const newValue = checkbox.checked
          ? [...value, option]
          : value.filter(v => v !== option);
        onChange(newValue);
        renderOptions(filterInput.value);
      });

      const text = document.createElement('span');
      text.textContent = option;

      label.appendChild(checkbox);
      label.appendChild(text);
      listContainer.appendChild(label);
    });
  }

  filterInput.addEventListener('input', () => {
    renderOptions(filterInput.value);
  });

  const selectedBadges = document.createElement('div');
  selectedBadges.className = 'multiselect-badges';

  function updateBadges() {
    selectedBadges.innerHTML = '';
    if (value.length === 0) {
      selectedBadges.innerHTML = '<span class="multiselect-placeholder">None selected</span>';
      return;
    }
    value.forEach(val => {
      const badge = document.createElement('span');
      badge.className = 'multiselect-badge';
      badge.innerHTML = `${val} <button class="multiselect-remove" data-value="${val}">×</button>`;

      badge.querySelector('.multiselect-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        const newValue = value.filter(v => v !== val);
        onChange(newValue);
        updateBadges();
        renderOptions(filterInput.value);
      });

      selectedBadges.appendChild(badge);
    });
  }

  renderOptions();
  updateBadges();

  container.appendChild(selectedBadges);
  container.appendChild(filterInput);
  container.appendChild(listContainer);

  return {
    element: container,
    update: (newValue) => {
      value = newValue;
      updateBadges();
      renderOptions(filterInput.value);
    }
  };
}
