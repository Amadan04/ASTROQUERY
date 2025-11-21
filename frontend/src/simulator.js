import { getSchema, searchEvidence, runPrediction, getCurve, compareScenarios } from './sim-api.js';
import { createMultiSelect } from './multiselect.js';

const STORAGE_KEY = 'simulator:scenario';

export async function renderSimulator(container) {
  let schema = null;
  let organismSelect, tissueSelect, countermeasuresSelect;
  let scenario = loadScenario();

  container.innerHTML = `
    <div class="sim-header">
      <h1 class="page-title">Mission Simulator</h1>
      <div class="sim-actions">
        <button id="retrieveBtn" class="btn ghost">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          Retrieve
        </button>
        <button id="runBtn" class="btn primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10 8 16 12 10 16 10 8"></polygon>
          </svg>
          Run
        </button>
        <button id="curveBtn" class="btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          Curve
        </button>
        <button id="compareBtn" class="btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="18" r="3"></circle>
            <circle cx="6" cy="6" r="3"></circle>
            <path d="M6 21V9a9 9 0 0 0 9 9"></path>
          </svg>
          Compare
        </button>
      </div>
    </div>

    <div class="sim-layout">
      <div class="sim-controls">
        <div class="panel">
          <h3>Question</h3>
          <textarea id="questionInput" rows="3" placeholder="Enter your research question...">${scenario.question}</textarea>
        </div>

        <div class="panel">
          <h3>Scenario Parameters</h3>

          <div class="form-group">
            <label>Organism</label>
            <div id="organismSelect"></div>
          </div>

          <div class="form-group">
            <label>Tissue</label>
            <div id="tissueSelect"></div>
          </div>

          <div class="form-group">
            <label>Microgravity Days</label>
            <input type="number" id="microgravityInput" min="0" value="${scenario.microgravity_days}" />
          </div>

          <div class="form-group">
            <label>Radiation (Gy)</label>
            <input type="number" id="radiationInput" min="0" step="0.1" value="${scenario.radiation_Gy}" />
          </div>

          <div class="form-group">
            <label>Countermeasures</label>
            <div id="countermeasuresSelect"></div>
          </div>
        </div>

        <div class="panel sim-notes">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Quick Guide
          </h3>
          <ul>
            <li><strong>Retrieve:</strong> Preview evidence for your question</li>
            <li><strong>Run:</strong> Generate predictions with probabilities</li>
            <li><strong>Curve:</strong> Simulate outcomes over mission days</li>
            <li><strong>Compare:</strong> Contrast two scenarios side-by-side</li>
          </ul>
        </div>
      </div>

      <div class="sim-results">
        <div class="panel" id="predictionsPanel">
          <h3>Predictions</h3>
          <div id="predictionsContent" class="sim-empty">
            <p>No predictions yet. Click <strong>Run</strong> to generate predictions.</p>
          </div>
        </div>

        <div class="panel" id="curvePanel">
          <h3>Mission Curve</h3>
          <div id="curveContent" class="sim-empty">
            <p>Click <strong>Curve</strong> to simulate over time.</p>
          </div>
        </div>

        <div class="panel" id="retrieverPanel">
          <h3>Evidence Snippets</h3>
          <div id="retrieverContent" class="sim-empty">
            <p>Click <strong>Retrieve</strong> to preview evidence.</p>
          </div>
        </div>
      </div>
    </div>

    <div id="compareDrawer" class="drawer" hidden>
      <div class="drawer-overlay"></div>
      <div class="drawer-content">
        <div class="drawer-header">
          <h2>Compare Scenarios</h2>
          <button id="closeDrawer" class="btn-close">×</button>
        </div>
        <div class="drawer-body">
          <div id="compareForm"></div>
          <div id="compareResults"></div>
        </div>
      </div>
    </div>
  `;

  try {
    schema = await getSchema();

    organismSelect = createMultiSelect({
      options: schema.inputs?.organism?.values || [],
      value: scenario.organism,
      onChange: (val) => { scenario.organism = val; saveScenario(scenario); }
    });
    container.querySelector('#organismSelect').appendChild(organismSelect.element);

    tissueSelect = createMultiSelect({
      options: schema.inputs?.tissue?.values || [],
      value: scenario.tissue,
      onChange: (val) => { scenario.tissue = val; saveScenario(scenario); }
    });
    container.querySelector('#tissueSelect').appendChild(tissueSelect.element);

    countermeasuresSelect = createMultiSelect({
      options: schema.inputs?.countermeasures?.values || [],
      value: scenario.countermeasures,
      onChange: (val) => { scenario.countermeasures = val; saveScenario(scenario); }
    });
    container.querySelector('#countermeasuresSelect').appendChild(countermeasuresSelect.element);

  } catch (error) {
    showError(`Failed to load schema: ${error.message}`);
  }

  const questionInput = container.querySelector('#questionInput');
  const microgravityInput = container.querySelector('#microgravityInput');
  const radiationInput = container.querySelector('#radiationInput');

  questionInput.addEventListener('input', () => {
    scenario.question = questionInput.value;
    saveScenario(scenario);
  });

  microgravityInput.addEventListener('input', () => {
    scenario.microgravity_days = parseFloat(microgravityInput.value) || 0;
    saveScenario(scenario);
  });

  radiationInput.addEventListener('input', () => {
    scenario.radiation_Gy = parseFloat(radiationInput.value) || 0;
    saveScenario(scenario);
  });

  const retrieveBtn = container.querySelector('#retrieveBtn');
  const runBtn = container.querySelector('#runBtn');
  const curveBtn = container.querySelector('#curveBtn');
  const compareBtn = container.querySelector('#compareBtn');

  retrieveBtn.addEventListener('click', () => handleRetrieve(scenario, container));
  runBtn.addEventListener('click', () => handleRun(scenario, container));
  curveBtn.addEventListener('click', () => handleCurve(scenario, container));
  compareBtn.addEventListener('click', () => handleCompare(scenario, container, schema));

  const urlParams = new URLSearchParams(location.hash.split('?')[1] || '');
  if (urlParams.has('q')) {
    questionInput.value = urlParams.get('q');
    scenario.question = urlParams.get('q');
    saveScenario(scenario);
  }
}

async function handleRetrieve(scenario, container) {
  const btn = container.querySelector('#retrieveBtn');
  const content = container.querySelector('#retrieverContent');

  setLoading(btn, true);
  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await searchEvidence(scenario.question, 8);
    const results = data.results || data;

    if (results.length === 0) {
      content.innerHTML = '<p class="sim-empty">No evidence found.</p>';
      return;
    }

    content.innerHTML = results.map((item, idx) => `
      <div class="evidence-snippet">
        <div class="snippet-header">
          <span class="snippet-id">#${item.id || idx + 1}</span>
          ${item.score ? `<span class="snippet-score">${item.score.toFixed(3)}</span>` : ''}
        </div>
        <p class="snippet-text">${truncate(item.text || item.snippet || '', 200)}</p>
      </div>
    `).join('');

  } catch (error) {
    content.innerHTML = `<div class="error-state">${error.message}</div>`;
  } finally {
    setLoading(btn, false);
  }
}

async function handleRun(scenario, container) {
  const btn = container.querySelector('#runBtn');
  const content = container.querySelector('#predictionsContent');

  setLoading(btn, true);
  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await runPrediction(scenario);
    const predictions = data.predictions || data;

    if (!predictions || predictions.length === 0) {
      content.innerHTML = '<p class="sim-empty">No predictions returned.</p>';
      return;
    }

    content.innerHTML = predictions.map((pred, idx) => {
      const outcome = pred.outcome || pred.label || `Outcome ${idx + 1}`;
      const prob = pred.probability ?? pred.confidence ?? 0;
      const ci95 = pred.ci95 || pred.CI95;
      const direction = pred.direction;
      const evidence = pred.evidence || [];

      return `
        <div class="prediction-card">
          <div class="prediction-header">
            <h4>${outcome}</h4>
            ${direction ? `<span class="direction-badge ${direction}">${direction}</span>` : ''}
          </div>
          <div class="prediction-prob">
            <span class="prob-value">${prob.toFixed(3)}</span>
            ${ci95 ? `<span class="prob-ci">CI95: [${ci95[0].toFixed(3)}, ${ci95[1].toFixed(3)}]</span>` : ''}
          </div>
          ${evidence.length > 0 ? `
            <details class="prediction-evidence">
              <summary>Evidence (${evidence.length})</summary>
              <div class="evidence-list">
                ${evidence.map(e => `
                  <div class="evidence-item">
                    ${e.relation ? `<span class="evidence-relation">${e.relation}</span>` : ''}
                    <p>${e.sentence || e.text || ''}</p>
                    ${e.confidence ? `<span class="evidence-confidence">${e.confidence.toFixed(3)}</span>` : ''}
                  </div>
                `).join('')}
              </div>
            </details>
          ` : ''}
        </div>
      `;
    }).join('');

    setTimeout(() => {
      container.querySelector('#predictionsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

  } catch (error) {
    content.innerHTML = `<div class="error-state">${error.message}</div>`;
  } finally {
    setLoading(btn, false);
  }
}

async function handleCurve(scenario, container) {
  const btn = container.querySelector('#curveBtn');
  const content = container.querySelector('#curveContent');

  setLoading(btn, true);
  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await getCurve(scenario, 120, 10);
    const points = data.points || data;

    if (!points || points.length === 0) {
      content.innerHTML = '<p class="sim-empty">No curve data returned.</p>';
      return;
    }

    content.innerHTML = points.map(point => {
      const predictions = point.predictions || [];
      return `
        <div class="curve-point">
          <h4>Day ${point.day}</h4>
          <div class="curve-predictions">
            ${predictions.map(pred => {
              const outcome = pred.outcome || pred.label || 'Outcome';
              const prob = pred.probability ?? pred.confidence ?? 0;
              return `
                <div class="curve-pred-item">
                  <span class="curve-outcome">${outcome}</span>
                  <span class="curve-prob">${prob.toFixed(3)}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    setTimeout(() => {
      container.querySelector('#curvePanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

  } catch (error) {
    content.innerHTML = `<div class="error-state">${error.message}</div>`;
  } finally {
    setLoading(btn, false);
  }
}

async function handleCompare(scenario, container, schema) {
  const drawer = container.querySelector('#compareDrawer');
  const formContainer = container.querySelector('#compareForm');
  const resultsContainer = container.querySelector('#compareResults');

  drawer.hidden = false;

  const baseline = { ...scenario };
  const variant = { ...scenario };

  formContainer.innerHTML = `
    <div class="compare-forms">
      <div class="compare-form-section">
        <h3>Baseline</h3>
        <div class="form-group">
          <label>Microgravity Days</label>
          <input type="number" id="baselineDays" value="${baseline.microgravity_days}" />
        </div>
        <div class="form-group">
          <label>Radiation (Gy)</label>
          <input type="number" id="baselineRad" step="0.1" value="${baseline.radiation_Gy}" />
        </div>
      </div>
      <div class="compare-form-section">
        <h3>Variant</h3>
        <div class="form-group">
          <label>Microgravity Days</label>
          <input type="number" id="variantDays" value="${variant.microgravity_days}" />
        </div>
        <div class="form-group">
          <label>Radiation (Gy)</label>
          <input type="number" id="variantRad" step="0.1" value="${variant.radiation_Gy}" />
        </div>
      </div>
    </div>
    <button id="runCompare" class="btn primary full-width" style="margin-top:16px;">Run Comparison</button>
  `;

  resultsContainer.innerHTML = '';

  const runCompareBtn = formContainer.querySelector('#runCompare');
  runCompareBtn.addEventListener('click', async () => {
    baseline.microgravity_days = parseFloat(formContainer.querySelector('#baselineDays').value) || 0;
    baseline.radiation_Gy = parseFloat(formContainer.querySelector('#baselineRad').value) || 0;
    variant.microgravity_days = parseFloat(formContainer.querySelector('#variantDays').value) || 0;
    variant.radiation_Gy = parseFloat(formContainer.querySelector('#variantRad').value) || 0;

    setLoading(runCompareBtn, true);
    resultsContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
      const data = await compareScenarios(baseline, variant);
      const comparisons = data.comparisons || data.results || data;

      if (!comparisons || comparisons.length === 0) {
        resultsContainer.innerHTML = '<p class="sim-empty">No comparison data returned.</p>';
        return;
      }

      const sorted = [...comparisons].sort((a, b) =>
        Math.abs(b.delta || 0) - Math.abs(a.delta || 0)
      );

      resultsContainer.innerHTML = `
        <table class="compare-table">
          <thead>
            <tr>
              <th>Outcome</th>
              <th>Baseline</th>
              <th>Variant</th>
              <th>Δ</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.map(row => {
              const outcome = row.outcome || row.label || '';
              const baseProb = row.baseline_prob ?? row.baseline ?? 0;
              const varProb = row.variant_prob ?? row.variant ?? 0;
              const delta = row.delta ?? (varProb - baseProb);
              const deltaClass = delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral';

              return `
                <tr>
                  <td>${outcome}</td>
                  <td>${baseProb.toFixed(3)}</td>
                  <td>${varProb.toFixed(3)}</td>
                  <td class="delta ${deltaClass}">${delta >= 0 ? '+' : ''}${delta.toFixed(3)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;

    } catch (error) {
      resultsContainer.innerHTML = `<div class="error-state">${error.message}</div>`;
    } finally {
      setLoading(runCompareBtn, false);
    }
  });

  container.querySelector('#closeDrawer').addEventListener('click', () => {
    drawer.hidden = true;
  });

  container.querySelector('.drawer-overlay').addEventListener('click', () => {
    drawer.hidden = true;
  });
}

function setLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn.classList.add('loading');
    const spinner = '<div class="btn-spinner"><div class="spinner-sm"></div></div>';
    btn.insertAdjacentHTML('afterbegin', spinner);
  } else {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.querySelector('.btn-spinner')?.remove();
  }
}

function showError(message) {
  console.error(message);
}

function truncate(text, length) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

function loadScenario() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to load scenario from localStorage');
  }
  return {
    question: 'microgravity bone',
    organism: [],
    tissue: [],
    microgravity_days: 30,
    radiation_Gy: 0.0,
    countermeasures: []
  };
}

function saveScenario(scenario) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenario));
  } catch (e) {
    console.warn('Failed to save scenario to localStorage');
  }
}
