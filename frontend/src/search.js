import { enableCardHoverTilt } from './ui-effects.js';
import { searchSemantic } from './api-client.js';
import { openInsightsModal } from './insights-modal.js';

export const SECTIONS = ["Immune","Plants","Microgravity","Cellular","Genomics"];

export function parseHashParams(){
  const q = (location.hash.split('?')[1]||'');
  const p = new URLSearchParams(q);
  const years = (p.get('years')||'2005-2021').split('-').map(n=>parseInt(n,10));
  const sections = (p.get('sections')||'').split(',').filter(Boolean);
  return { q: p.get('q')||'', years:[years[0], years[1]], sections };
}

export function writeHashParams(state){
  const s = new URLSearchParams();
  s.set('q', state.q||'');
  s.set('years', `${state.years[0]}-${state.years[1]}`);
  s.set('sections', state.sections.join(','));
  history.replaceState({}, '', `#/?${s.toString()}`);
}

export async function searchPublications(q, sections, years){
  if (!q || q.trim() === '') {
    return [];
  }
  
  try {
    const [minY, maxY] = years;
    const params = {
      q: q,
      k: 20,
      year_from: minY,
      year_to: maxY,
      suggestions: true
    };
    
    const data = await searchSemantic(params);
    return data.results || [];
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

function renderHeader(state, listLen){
  const host = document.getElementById('resultsHdr');
  if(!host) return;

  const chips = state.sections.map(s=>`<span class="filter-chip">${s}</span>`).join('');
  const yearsBadge = (state.years[0]!==2005 || state.years[1]!==2021)
    ? `<span class="filter-chip">Years: ${state.years[0]}–${state.years[1]}</span>`
    : '';

  host.innerHTML = `<span><strong>${listLen}</strong> results</span>${chips}${yearsBadge}`;
}

export function renderCards(list){
  const host = document.getElementById('results');
  host.innerHTML = list.map(pub=>{
    const sections = (pub.sections || []).sort().map(s=>`<span class="tag">${s}</span>`).join('');
    const distanceBadge = pub.distance !== undefined
      ? `<span class="distance-badge" title="Cosine distance (lower is better)">${pub.distance.toFixed(3)}</span>`
      : '';

    return `
      <article class="card semantic-result">
        <div class="card-header-row">
          <h4><a href="${pub.link}" target="_blank" rel="noopener noreferrer">${pub.title}</a></h4>
          ${distanceBadge}
        </div>
        <div class="meta">${pub.journal || 'Unknown Journal'} &middot; ${pub.year}</div>
        <div class="tags">${sections}</div>
        <div class="card-actions">
          <button class="btn sm ghost" onclick="window.open('${pub.link}','_blank','noopener,noreferrer')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Expand
          </button>
          <button class="btn sm ghost" onclick="window.location.hash='#/summary/${pub.id}'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Summarize
          </button>
          <button class="btn sm insights-btn" data-pub-id="${pub.id}" data-title="${pub.title.replace(/"/g, '&quot;')}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Insights
          </button>
        </div>
      </article>
    `;
  }).join('');

  // Add event listeners for insights buttons
  document.querySelectorAll('.insights-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pubId = btn.dataset.pubId;
      const title = btn.dataset.title;
      openInsightsModal(pubId, title);
    });
  });
}

export function renderSemanticCards(results){
  const host = document.getElementById('results');
  host.innerHTML = results.map(pub=>{
    const sections = (pub.sections || []).sort().map(s=>`<span class="tag">${s}</span>`).join('');
    const distanceBadge = pub.distance !== undefined
      ? `<span class="distance-badge" title="Cosine distance (lower is better)">${pub.distance.toFixed(3)}</span>`
      : '';

    return `
      <article class="card semantic-result">
        <div class="card-header-row">
          <h4><a href="${pub.link}" target="_blank" rel="noopener noreferrer">${pub.title}</a></h4>
          ${distanceBadge}
        </div>
        <div class="meta">${pub.journal || 'Unknown Journal'} &middot; ${pub.year}</div>
        <div class="tags">${sections}</div>
        <div class="card-actions">
          <button class="btn sm ghost" onclick="window.open('${pub.link}','_blank','noopener,noreferrer')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Expand
          </button>
          <button class="btn sm ghost" onclick="window.location.hash='#/summary/${pub.id}'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Summarize
          </button>
          <button class="btn sm insights-btn" data-pub-id="${pub.id}" data-title="${pub.title.replace(/"/g, '&quot;')}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Insights
          </button>
        </div>
      </article>
    `;
  }).join('');

  document.querySelectorAll('.insights-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pubId = btn.dataset.pubId;
      const title = btn.dataset.title;
      openInsightsModal(pubId, title);
    });
  });
}

export function focusSearch(){
  document.getElementById('q')?.focus();
}

function updateResultsOffset(){
  const layer = document.getElementById('search-layer');
  const header = document.getElementById('appHeader');
  if (!layer) return;
  const rect = layer.getBoundingClientRect();
  const topPad = (header?.offsetHeight || 64);
  const px = Math.max( (rect.top + rect.height + 16), topPad + 120 );
  document.documentElement.style.setProperty('--resultsTop', px + 'px');
}

export function initSearchUI(){
  const qs = parseHashParams();
  const qEl = document.getElementById('q');
  const goBtn = document.getElementById('goBtn');
  const fBtn = document.getElementById('filtersBtn');
  const panel = document.getElementById('filtersPanel');
  const sectionsHost = document.getElementById('sectionChips');
  const yMin=document.getElementById('yMin');
  const yMax=document.getElementById('yMax');
  const yearLabel = document.getElementById('yearLabel');

  document.getElementById('resultsHdr')?.classList.add('hidden');
  document.getElementById('results')?.classList.add('hidden');

  qEl.value = qs.q;
  yMin.value = String(qs.years[0]);
  yMax.value = String(qs.years[1]);
  yearLabel.textContent = `${qs.years[0]} – ${qs.years[1]}`;

  sectionsHost.id = 'sectionsList';
  sectionsHost.innerHTML = `
    <label style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">
      <input type="checkbox" id="secAll" checked> <strong>Select All</strong>
    </label>
    ${SECTIONS.map(s=>`
      <label style="display:flex;gap:6px;align-items:center;margin:4px 0;">
        <input type="checkbox" class="secBox" data-v="${s}" ${qs.sections.length===0 || qs.sections.includes(s)?'checked':''}>
        ${s}
      </label>
    `).join('')}
  `;

  const secAll = document.getElementById('secAll');
  const secBoxes = () => Array.from(document.querySelectorAll('.secBox'));
  secAll?.addEventListener('change', () => { secBoxes().forEach(cb => cb.checked = secAll.checked); });
  sectionsHost.addEventListener('change', (e)=>{
    if (e.target.classList?.contains('secBox')){
      const allChecked = secBoxes().every(cb => cb.checked);
      secAll.checked = allChecked;
    }
  });

  const getState = ()=>({
    q: qEl.value.trim(),
    years:[parseInt(yMin.value,10), parseInt(yMax.value,10)],
    sections: secBoxes().filter(cb => cb.checked).map(cb => cb.getAttribute('data-v'))
  });

  const reveal = (has) => {
    const hdr = document.getElementById('resultsHdr');
    const res = document.getElementById('results');
    if (has) {
      hdr?.classList.remove('hidden');
      res?.classList.remove('hidden');
    } else {
      hdr?.classList.add('hidden');
      res?.classList.add('hidden');
      if(res) res.innerHTML='';
      if(hdr) hdr.innerHTML='';
    }
  };

  const apply = async ()=>{
    const state = getState();
    writeHashParams(state);
    yearLabel.textContent = `${state.years[0]} – ${state.years[1]}`;

    const list = await searchPublications(state.q, state.sections, state.years);
    renderCards(list);
    renderHeader(state, list.length);
    try { enableCardHoverTilt('#results .card'); } catch {}
    updateResultsOffset();
    reveal(list.length > 0);
  };

  fBtn.onclick = ()=>{
    const open = panel.hasAttribute('hidden');
    panel.toggleAttribute('hidden');
    fBtn.setAttribute('aria-expanded', open?'true':'false');
    setTimeout(updateResultsOffset, 0);
  };

  document.getElementById('closeFilters').onclick = ()=>{
    panel.setAttribute('hidden','');
    fBtn.setAttribute('aria-expanded','false');
    setTimeout(updateResultsOffset, 0);
  };

  document.getElementById('clearFilters').onclick = ()=>{
    secBoxes().forEach(cb => cb.checked = true);
    secAll.checked = true;
    yMin.value='2005';
    yMax.value='2021';
    yearLabel.textContent = '2005 – 2021';
  };

  yMin.oninput = yMax.oninput = ()=>{
    yearLabel.textContent = `${yMin.value} – ${yMax.value}`;
  };

  qEl.addEventListener('keydown', (e)=>{
    if(e.key==='Enter'){
      apply();
    }
  });

  goBtn.onclick = apply;

  const navSearch = document.querySelector('a[href="#/"]');
  if(navSearch){
    navSearch.addEventListener('click', ()=> setTimeout(()=> qEl.focus(), 0));
  }

  document.addEventListener('keydown', (e)=>{
    if(e.key==='/' && document.activeElement?.id!=='q' && document.activeElement?.tagName!=='INPUT'){
      e.preventDefault();
      qEl.focus();
    }
  });

  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){
      panel.setAttribute('hidden','');
      fBtn.setAttribute('aria-expanded','false');
      setTimeout(updateResultsOffset, 0);
    }
  });

  window.addEventListener('resize', updateResultsOffset);
  setTimeout(updateResultsOffset, 0);

  initSemanticSearch();
}

export function initSemanticSearch() {
  let semanticParams = {
    k: 10,
    section: '',
    year_from: null,
    year_to: null,
    journal: '',
    restricted: false,
    suggestions: false
  };

  function showSemanticFilters() {
    const filtersPanel = document.getElementById('filtersPanel');
    if (!filtersPanel) return;

    const existingSemantic = document.getElementById('semanticFilters');
    if (existingSemantic) return;

    const semanticHTML = `
      <div id="semanticFilters" class="semantic-filters-section">
        <h4 style="margin:12px 0 8px; font-size:14px; color:#cfe7ff;">Semantic Search Options</h4>

        <div class="row" style="margin:8px 0;">
          <label style="font-size:13px; color:#b7d3ff;">Results (k)</label>
          <input type="number" id="semanticK" min="1" max="50" value="10" style="width:80px; padding:6px 8px; background:rgba(12,21,38,.6); border:1px solid var(--stroke); border-radius:6px; color:inherit;">
        </div>

        <div class="row" style="margin:8px 0;">
          <label style="font-size:13px; color:#b7d3ff;">Section Filter</label>
          <select id="semanticSection" style="width:100%; padding:6px 8px; background:rgba(12,21,38,.6); border:1px solid var(--stroke); border-radius:6px; color:inherit;">
            <option value="">All Sections</option>
            <option value="introduction">Introduction</option>
            <option value="methods">Methods</option>
            <option value="results">Results</option>
            <option value="discussion">Discussion</option>
            <option value="conclusion">Conclusion</option>
          </select>
        </div>

        <div class="row" style="margin:8px 0;">
          <label style="font-size:13px; color:#b7d3ff;">Year Range</label>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="number" id="semanticYearFrom" placeholder="From" style="width:80px; padding:6px 8px; background:rgba(12,21,38,.6); border:1px solid var(--stroke); border-radius:6px; color:inherit;">
            <span style="color:#9cb9dd;">–</span>
            <input type="number" id="semanticYearTo" placeholder="To" style="width:80px; padding:6px 8px; background:rgba(12,21,38,.6); border:1px solid var(--stroke); border-radius:6px; color:inherit;">
          </div>
        </div>

        <div class="row" style="margin:8px 0;">
          <label style="font-size:13px; color:#b7d3ff;">Journal</label>
          <input type="text" id="semanticJournal" placeholder="Journal name..." style="width:100%; padding:6px 8px; background:rgba(12,21,38,.6); border:1px solid var(--stroke); border-radius:6px; color:inherit;">
        </div>

        <div class="row" style="margin:8px 0;">
          <label style="display:flex; align-items:center; gap:6px; font-size:13px; color:#b7d3ff; cursor:pointer;">
            <input type="checkbox" id="semanticRestricted">
            Restricted access only
          </label>
        </div>

        <div class="row" style="margin:8px 0;">
          <label style="display:flex; align-items:center; gap:6px; font-size:13px; color:#b7d3ff; cursor:pointer;">
            <input type="checkbox" id="semanticSuggestions">
            Get AI suggestions
          </label>
        </div>
      </div>
    `;

    filtersPanel.insertAdjacentHTML('afterbegin', semanticHTML);

    document.getElementById('semanticK').addEventListener('input', (e) => {
      let val = parseInt(e.target.value, 10);
      if (val < 1) val = 1;
      if (val > 50) val = 50;
      semanticParams.k = val;
    });

    document.getElementById('semanticSection').addEventListener('change', (e) => {
      semanticParams.section = e.target.value;
    });

    document.getElementById('semanticYearFrom').addEventListener('input', (e) => {
      const val = e.target.value ? parseInt(e.target.value, 10) : null;
      semanticParams.year_from = val;
    });

    document.getElementById('semanticYearTo').addEventListener('input', (e) => {
      const val = e.target.value ? parseInt(e.target.value, 10) : null;
      semanticParams.year_to = val;
    });

    document.getElementById('semanticJournal').addEventListener('input', (e) => {
      semanticParams.journal = e.target.value.trim();
    });

    document.getElementById('semanticRestricted').addEventListener('change', (e) => {
      semanticParams.restricted = e.target.checked;
    });

    document.getElementById('semanticSuggestions').addEventListener('change', (e) => {
      semanticParams.suggestions = e.target.checked;
    });
  }

  function hideSemanticFilters() {
    const semanticFilters = document.getElementById('semanticFilters');
    if (semanticFilters) {
      semanticFilters.remove();
    }
  }

  async function performSemanticSearch(state) {
    if (!state.q) return;

    const warningArea = document.getElementById('semanticWarning') || createWarningArea();
    const suggestionsArea = document.getElementById('semanticSuggestions') || createSuggestionsArea();

    warningArea.hidden = true;
    suggestionsArea.hidden = true;

    try {
      const params = {
        q: state.q,
        k: semanticParams.k,
        section: semanticParams.section,
        year_from: state.years[0] !== 2005 ? state.years[0] : semanticParams.year_from,
        year_to: state.years[1] !== 2021 ? state.years[1] : semanticParams.year_to,
        journal: semanticParams.journal,
        restricted: semanticParams.restricted,
        suggestions: semanticParams.suggestions
      };

      if (!params.section) delete params.section;
      if (!params.year_from) delete params.year_from;
      if (!params.year_to) delete params.year_to;
      if (!params.journal) delete params.journal;

      const data = await searchSemantic(params);

      if (data.warning) {
        warningArea.hidden = false;
        warningArea.querySelector('.warning-text').textContent = data.warning;
      }

      if (data.suggestions && data.suggestions.length > 0) {
        suggestionsArea.hidden = false;
        renderSuggestions(data.suggestions, state.q);
      }

    } catch (error) {
      console.warn('Semantic search enhancement failed:', error);
    }
  }

  function createWarningArea() {
    const area = document.createElement('div');
    area.id = 'semanticWarning';
    area.className = 'semantic-warning';
    area.hidden = true;
    area.innerHTML = '<span class="warning-text"></span>';

    const resultsHdr = document.getElementById('resultsHdr');
    if (resultsHdr) {
      resultsHdr.insertAdjacentElement('afterend', area);
    }

    return area;
  }

  function createSuggestionsArea() {
    const area = document.createElement('div');
    area.id = 'semanticSuggestions';
    area.className = 'semantic-suggestions';
    area.hidden = true;

    const resultsHdr = document.getElementById('resultsHdr');
    if (resultsHdr) {
      resultsHdr.insertAdjacentElement('afterend', area);
    }

    return area;
  }

  function renderSuggestions(suggestions, currentQuery) {
    const area = document.getElementById('semanticSuggestions');
    if (!area) return;

    area.innerHTML = `
      <div style="margin-bottom:8px; font-size:13px; color:#9cb9dd;">Suggested queries:</div>
      <div class="suggestions-chips">
        ${suggestions.map(s => `
          <button class="suggestion-chip ${s === currentQuery ? 'active' : ''}" data-query="${s.replace(/"/g, '&quot;')}">${s}</button>
        `).join('')}
      </div>
    `;

    area.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        const qEl = document.getElementById('q');
        if (qEl) {
          qEl.value = query;
          document.getElementById('goBtn')?.click();
        }
      });
    });
  }

  showSemanticFilters();
}
