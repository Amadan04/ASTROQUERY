import { analyzeResearchPaper } from './api-client.js';

let currentAbortController = null;

export async function renderDeepResearch(host) {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }

  host.innerHTML = `
    <div class="research-page">
      <div class="research-header">
        <h1 class="page-title">Deep Research Intelligence</h1>
        <p class="page-subtitle">Evaluate novelty and originality of your research</p>
      </div>

      <div class="research-container">
        <form id="analysisForm" class="panel research-form-panel" novalidate>
          <h3 style="margin-bottom: 20px;">Research Paper Analysis</h3>

          <div class="form-group">
            <label>Paper Title</label>
            <input type="text" id="paperTitle" placeholder="Enter paper title..." />
          </div>

          <div class="sections-input">
            <div class="section-accordion">
              <button type="button" class="section-header" data-section="abstract">
                <span class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  Abstract
                </span>
                <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div class="section-content" hidden>
                <textarea id="abstractText" rows="6" placeholder="Paste your abstract here..."></textarea>
                <div class="section-actions">
                  <button class="btn-upload sm" data-target="abstractText">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Upload .txt/.md
                  </button>
                </div>
              </div>
            </div>

            <div class="section-accordion">
              <button type="button" class="section-header" data-section="methods">
                <span class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                  </svg>
                  Methods
                </span>
                <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div class="section-content" hidden>
                <textarea id="methodsText" rows="6" placeholder="Paste your methods here..."></textarea>
                <div class="section-actions">
                  <button class="btn-upload sm" data-target="methodsText">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Upload .txt/.md
                  </button>
                </div>
              </div>
            </div>

            <div class="section-accordion">
              <button type="button" class="section-header" data-section="results">
                <span class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  Results
                </span>
                <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div class="section-content" hidden>
                <textarea id="resultsText" rows="6" placeholder="Paste your results here..."></textarea>
                <div class="section-actions">
                  <button class="btn-upload sm" data-target="resultsText">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Upload .txt/.md
                  </button>
                </div>
              </div>
            </div>

            <div class="section-accordion">
              <button type="button" class="section-header" data-section="discussion">
                <span class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Discussion
                </span>
                <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div class="section-content" hidden>
                <textarea id="discussionText" rows="6" placeholder="Paste your discussion here..."></textarea>
                <div class="section-actions">
                  <button class="btn-upload sm" data-target="discussionText">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Upload .txt/.md
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" id="analyzeBtn" class="btn primary full-width" style="margin-top: 24px;" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Analyze Paper
          </button>
        </form>

        <div id="resultsArea" class="research-results" hidden>
          <div class="panel novelty-score-panel">
            <h3 style="text-align: center; margin-bottom: 20px;">Overall Novelty Score</h3>
            <div class="circular-progress" title="Estimated originality score (higher = more novel)">
              <svg class="progress-ring" width="160" height="160">
                <circle class="progress-ring-bg" cx="80" cy="80" r="70" stroke-width="10"></circle>
                <circle class="progress-ring-fg" cx="80" cy="80" r="70" stroke-width="10" id="progressCircle"></circle>
              </svg>
              <div class="progress-text">
                <span id="noveltyPercent" class="progress-value">0</span>
                <span class="progress-label">%</span>
              </div>
            </div>
          </div>

          <div class="panel section-results-panel">
            <h3 style="margin-bottom: 16px;">Section Analysis</h3>
            <div id="sectionResults"></div>
          </div>

          <div class="panel meta-summary-panel">
            <h3 style="margin-bottom: 16px;">AI Meta-Analysis</h3>
            <div id="metaSummary" class="meta-summary-content"></div>
          </div>
        </div>

        <div id="loadingOverlay" class="loading-overlay" hidden>
          <div class="loading-content">
            <div class="spinner"></div>
            <p>Analyzing with NASA Research Engine...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  setupAccordions(host);
  setupFileUpload(host);
  setupAnalysis(host);
}

function setupAccordions(host) {
  host.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const chevron = header.querySelector('.chevron');
      const isHidden = content.hidden;

      content.hidden = !isHidden;
      chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  });

  host.querySelector('[data-section="abstract"]')?.click();
}

function setupFileUpload(host) {
  host.querySelectorAll('.btn-upload').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.md';

      input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          const text = await file.text();
          const textarea = document.getElementById(targetId);
          if (textarea) {
            textarea.value = text;
            checkFormValidity(host);
          }
        } catch (error) {
          showToast('Failed to read file', 'error');
        }
      });

      input.click();
    });
  });
}

function setupAnalysis(host) {
  const form = host.querySelector('#analysisForm');
  const paperTitle = host.querySelector('#paperTitle');
  const textareas = host.querySelectorAll('textarea');

  textareas.forEach(textarea => {
    textarea.addEventListener('input', () => checkFormValidity(host));
  });

  paperTitle.addEventListener('input', () => checkFormValidity(host));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const analyzeBtn = host.querySelector('#analyzeBtn');
    if (analyzeBtn.disabled) return;

    await performAnalysis(host);
  });
}

function checkFormValidity(host) {
  const title = host.querySelector('#paperTitle').value.trim();
  const abstract = host.querySelector('#abstractText').value.trim();
  const methods = host.querySelector('#methodsText').value.trim();
  const results = host.querySelector('#resultsText').value.trim();
  const discussion = host.querySelector('#discussionText').value.trim();

  const isValid = title && abstract && methods && results && discussion;

  host.querySelector('#analyzeBtn').disabled = !isValid;
}

async function performAnalysis(host) {
  const loadingOverlay = host.querySelector('#loadingOverlay');
  const resultsArea = host.querySelector('#resultsArea');
  const analyzeBtn = host.querySelector('#analyzeBtn');

  if (!loadingOverlay.hidden) {
    return;
  }

  const title = host.querySelector('#paperTitle').value.trim();
  const abstract = host.querySelector('#abstractText').value.trim();
  const methods = host.querySelector('#methodsText').value.trim();
  const results = host.querySelector('#resultsText').value.trim();
  const discussion = host.querySelector('#discussionText').value.trim();

  clearErrorState(host);

  const sections = {};
  if (abstract) sections.abstract = abstract;
  if (methods) sections.methods = methods;
  if (results) sections.results = results;
  if (discussion) sections.discussion = discussion;

  loadingOverlay.hidden = false;
  resultsArea.hidden = true;
  analyzeBtn.disabled = true;

  currentAbortController = new AbortController();

  try {
    console.log('🔬 Deep Research: Starting analysis...');
    const payload = { title, sections };
    console.log('🔬 Deep Research: Payload:', payload);
    
    const data = await analyzeResearchPaper(payload);
    console.log('🔬 Deep Research: Response received:', data);

    if (currentAbortController.signal.aborted) {
      console.log('🔬 Deep Research: Request was aborted');
      return;
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response from server');
    }

    console.log('🔬 Deep Research: Displaying results...');
    displayResults(host, data);

  } catch (error) {
    console.error('🔬 Deep Research: Error occurred:', error);
    
    if (currentAbortController.signal.aborted) {
      console.log('🔬 Deep Research: Request was aborted');
      return;
    }

    if (error.name === 'AbortError') {
      console.log('🔬 Deep Research: Request timed out');
      showErrorState(host, 'Analysis timed out. Please try again or check your connection.');
      showToast('Request timed out after 20 seconds', 'error');
    } else {
      const errorMsg = error.message || 'Analysis failed. Please try again.';
      console.log('🔬 Deep Research: Error message:', errorMsg);
      showErrorState(host, errorMsg);
      showToast(errorMsg, 'error');
    }
  } finally {
    console.log('🔬 Deep Research: Cleaning up...');
    loadingOverlay.hidden = true;
    analyzeBtn.disabled = false;
    currentAbortController = null;
  }
}

function showErrorState(host, message) {
  let errorCard = host.querySelector('#errorCard');

  if (!errorCard) {
    errorCard = document.createElement('div');
    errorCard.id = 'errorCard';
    errorCard.className = 'panel error-card';

    const formPanel = host.querySelector('.research-form-panel');
    formPanel.insertAdjacentElement('afterend', errorCard);
  }

  errorCard.innerHTML = `
    <div class="error-content">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <div class="error-message">
        <h4>Analysis Failed</h4>
        <p>${message}</p>
      </div>
    </div>
    <button type="button" id="retryBtn" class="btn sm">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      </svg>
      Retry
    </button>
  `;

  errorCard.hidden = false;

  const retryBtn = errorCard.querySelector('#retryBtn');
  retryBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearErrorState(host);
    performAnalysis(host);
  });
}

function clearErrorState(host) {
  const errorCard = host.querySelector('#errorCard');
  if (errorCard) {
    errorCard.hidden = true;
  }
}

function displayResults(host, data) {
  clearErrorState(host);

  const resultsArea = host.querySelector('#resultsArea');
  resultsArea.hidden = false;

  const overallNovelty = data.overall_novelty || 0;
  updateCircularProgress(host, overallNovelty);

  const sectionResults = host.querySelector('#sectionResults');
  sectionResults.innerHTML = '';

  if (data.section_results && data.section_results.length > 0) {
    data.section_results.forEach(section => {
      const card = createSectionResultCard(section);
      sectionResults.appendChild(card);
    });
  }

  const metaSummary = host.querySelector('#metaSummary');
  metaSummary.textContent = data.meta_summary || 'No meta-analysis available.';

  setTimeout(() => {
    resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function updateCircularProgress(host, percent) {
  const percentElem = host.querySelector('#noveltyPercent');
  const circle = host.querySelector('#progressCircle');

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  circle.style.strokeDasharray = `${circumference}`;
  circle.style.strokeDashoffset = circumference;

  setTimeout(() => {
    circle.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
    circle.style.strokeDashoffset = offset;

    animateNumber(percentElem, 0, percent, 1500);
  }, 100);
}

function animateNumber(element, start, end, duration) {
  const startTime = Date.now();

  function update() {
    const now = Date.now();
    const progress = Math.min((now - startTime) / duration, 1);
    const current = Math.floor(start + (end - start) * progress);

    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  update();
}

function createSectionResultCard(section) {
  const card = document.createElement('div');
  card.className = 'section-result-card';

  const sectionName = section.section_name || 'Section';
  const novelty = section.final_novelty || 0;
  const feedback = section.feedback || 'No feedback available.';

  card.innerHTML = `
    <div class="section-result-header">
      <div class="section-result-title">
        <h4>${sectionName}</h4>
        <span class="novelty-badge">${novelty.toFixed(1)}% Novelty</span>
      </div>
      <button class="toggle-feedback">
        <svg class="chevron-small" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
    <div class="section-feedback" hidden>
      <p>${feedback}</p>
    </div>
  `;

  const toggleBtn = card.querySelector('.toggle-feedback');
  const feedbackDiv = card.querySelector('.section-feedback');
  const chevron = card.querySelector('.chevron-small');

  toggleBtn.addEventListener('click', () => {
    feedbackDiv.hidden = !feedbackDiv.hidden;
    chevron.style.transform = feedbackDiv.hidden ? 'rotate(0deg)' : 'rotate(180deg)';

    if (!feedbackDiv.hidden) {
      feedbackDiv.style.animation = 'fadeInDown 0.3s ease';
    }
  });

  return card;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = 'position:fixed; top:80px; right:20px; z-index:1000; padding:12px 20px; border-radius:8px; font-size:14px; box-shadow:0 4px 12px rgba(0,0,0,.3); animation:slideInRight 0.3s ease;';

  if (type === 'error') {
    toast.style.background = 'rgba(255,100,100,.9)';
    toast.style.border = '1px solid #ff6464';
  } else if (type === 'warning') {
    toast.style.background = 'rgba(255,200,100,.9)';
    toast.style.border = '1px solid #ffb84d';
    toast.style.color = '#1a1a1a';
  } else {
    toast.style.background = 'rgba(0,234,255,.15)';
    toast.style.border = '1px solid rgba(0,234,255,.3)';
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
