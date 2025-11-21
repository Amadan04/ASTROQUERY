import { getInsights } from './api-client.js';

const insightsCache = new Map();

export function createInsightsModal() {
  const modal = document.createElement('div');
  modal.id = 'insightsModal';
  modal.className = 'modal';
  modal.hidden = true;

  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content insights-modal-content">
      <div class="modal-header">
        <h3 id="insightsTitle">AI Insights</h3>
        <button class="modal-close" aria-label="Close modal">×</button>
      </div>
      <div class="modal-body" id="insightsBody">
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Generating insights...</p>
        </div>
      </div>
      <div class="modal-footer">
        <button id="copyInsightsBtn" class="btn ghost sm" disabled>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy
        </button>
        <button id="closeInsightsBtn" class="btn sm">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const overlay = modal.querySelector('.modal-overlay');
  const closeBtn = modal.querySelector('.modal-close');
  const closeFooterBtn = modal.querySelector('#closeInsightsBtn');
  const copyBtn = modal.querySelector('#copyInsightsBtn');

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  };

  overlay.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  closeFooterBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });

  copyBtn.addEventListener('click', async () => {
    const body = modal.querySelector('#insightsBody');
    const textContent = body.textContent || '';

    try {
      await navigator.clipboard.writeText(textContent);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy
        `;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });

  return modal;
}

export async function openInsightsModal(pubId, title) {
  let modal = document.getElementById('insightsModal');
  if (!modal) {
    modal = createInsightsModal();
  }

  const titleEl = modal.querySelector('#insightsTitle');
  const bodyEl = modal.querySelector('#insightsBody');
  const copyBtn = modal.querySelector('#copyInsightsBtn');

  titleEl.textContent = title || 'AI Insights';
  copyBtn.disabled = true;

  modal.hidden = false;
  document.body.style.overflow = 'hidden';

  if (insightsCache.has(pubId)) {
    const cachedInsights = insightsCache.get(pubId);
    bodyEl.innerHTML = `<div class="insights-content">${formatInsights(cachedInsights)}</div>`;
    copyBtn.disabled = false;
    return;
  }

  bodyEl.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Generating insights...</p>
    </div>
  `;

  try {
    const data = await getInsights(pubId);
    const insights = data.insights || 'No insights available.';

    insightsCache.set(pubId, insights);

    bodyEl.innerHTML = `<div class="insights-content">${formatInsights(insights)}</div>`;
    copyBtn.disabled = false;

  } catch (error) {
    bodyEl.innerHTML = `
      <div class="error-state">
        <p class="error-message">${error.message}</p>
        <button class="btn sm retry-btn" data-pub-id="${pubId}">Retry</button>
      </div>
    `;

    const retryBtn = bodyEl.querySelector('.retry-btn');
    retryBtn.addEventListener('click', () => {
      insightsCache.delete(pubId);
      openInsightsModal(pubId, title);
    });
  }
}

export function closeInsightsModal() {
  const modal = document.getElementById('insightsModal');
  if (modal) {
    modal.hidden = true;
    document.body.style.overflow = '';
  }
}

function formatInsights(text) {
  return text
    .split('\n')
    .map(line => {
      line = line.trim();
      if (!line) return '<br>';
      if (line.startsWith('## ')) return `<h4>${line.slice(3)}</h4>`;
      if (line.startsWith('# ')) return `<h3>${line.slice(2)}</h3>`;
      if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`;
      if (line.match(/^\d+\. /)) return `<li>${line.replace(/^\d+\. /, '')}</li>`;
      return `<p>${line}</p>`;
    })
    .join('');
}
