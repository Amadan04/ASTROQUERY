import { PUBLICATIONS } from './data.js';
import { searchPublications } from './search.js';

export function renderAdvanced(host){
  host.innerHTML = `
    <div class="page-shell">
      <h2 class="card-title" style="margin-bottom:10px;">Advanced Search</h2>
      <div class="full-grid">
        <aside class="panel" style="position:sticky; top:86px;">
          <h3 style="margin-top:0">Filters</h3>
          <label>Query</label>
          <input id="advQ" class="input" placeholder="Keywords, title, abstract…" style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid var(--stroke); background:#0b1428; color:#eaf6ff;">
          <div style="height:10px;"></div>
          <label>Section</label>
          <select id="advSection" multiple size="6" class="input" style="width:100%;">
            ${['Immune','Plants','Microgravity','Cellular','Genomics'].map(s=>`<option>${s}</option>`).join('')}
          </select>
          <div style="height:10px;"></div>
          <label>Authors (comma-separated)</label>
          <input id="advAuthors" class="input" placeholder="e.g., Hawking, Kerr" style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid var(--stroke); background:#0b1428; color:#eaf6ff;">
          <div style="height:10px;"></div>
          <label>Journal / Source</label>
          <input id="advSource" class="input" placeholder="NASA, DOI, PubMed…" style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid var(--stroke); background:#0b1428; color:#eaf6ff;">
          <div style="height:10px;"></div>
          <label>Year Range</label>
          <div class="row"><input id="advMin" type="range" min="1990" max="2025" value="2005" class="input"><input id="advMax" type="range" min="1990" max="2025" value="2021" class="input"></div>
          <div id="advYearLbl" class="muted" style="margin-top:4px;">2005 – 2021</div>
          <div style="height:12px;"></div>
          <label>Sort By</label>
          <select id="advSort" class="input" style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid var(--stroke); background:#0b1428; color:#eaf6ff;">
            <option value="relevance">Relevance</option>
            <option value="year_desc">Year (newest)</option>
            <option value="year_asc">Year (oldest)</option>
          </select>
          <div style="height:12px;"></div>
          <button id="advRun" class="btn" style="width:100%;">Run Advanced Search</button>
        </aside>

        <section class="panel">
          <div class="toolbar" style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
            <input id="advQuick" class="input" placeholder="Quick filter within results…" style="flex:1; padding:10px 12px; border-radius:10px; border:1px solid var(--stroke); background:#0b1428; color:#eaf6ff;">
            <div class="muted" id="advCount">0 results</div>
          </div>
          <div class="stat" style="margin-bottom:10px;">
            <strong>Tip:</strong> Use <em>Section</em> + <em>Year</em> to reduce noise. Click a row to expand actions.
          </div>
          <div class="panel" style="padding:0;">
            <table id="advTable" style="width:100%; border-collapse:collapse;">
              <thead style="background:var(--panel-2);">
                <tr>
                  <th style="text-align:left; padding:10px 12px;">Title</th>
                  <th style="text-align:left; padding:10px 12px;">Authors</th>
                  <th style="text-align:left; padding:10px 12px;">Year</th>
                  <th style="text-align:left; padding:10px 12px;">Section</th>
                  <th style="text-align:left; padding:10px 12px;">Source</th>
                  <th style="text-align:left; padding:10px 12px;">Actions</th>
                </tr>
              </thead>
              <tbody id="advBody"></tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  `;

  const el = (id)=> host.querySelector('#'+id);
  const q=el('advQ'), sec=el('advSection'), au=el('advAuthors'), so=el('advSource'), s=el('advSort');
  const min=el('advMin'), max=el('advMax'), ylbl=el('advYearLbl'), run=el('advRun'), quick=el('advQuick');
  const body=el('advBody'), count=el('advCount');

  const getState = ()=>({
    q: q.value.trim(),
    sections: [...sec.selectedOptions].map(o=>o.value),
    years: [parseInt(min.value,10), parseInt(max.value,10)],
    authors: au.value.toLowerCase(),
    source: so.value.toLowerCase(),
    sort: s.value,
    quick: quick.value.toLowerCase()
  });

  function renderRows(list){
    body.innerHTML = list.map(p=>`
      <tr style="border-top:1px solid var(--stroke)">
        <td style="padding:10px 12px; max-width:420px;">${p.title}</td>
        <td style="padding:10px 12px;">${p.authors.join(', ')}</td>
        <td style="padding:10px 12px;">${p.year}</td>
        <td style="padding:10px 12px;">${p.section}</td>
        <td style="padding:10px 12px;">${p.source}</td>
        <td style="padding:10px 12px;">
          <button class="btn" onclick="(function(url){const w=window.open(url,'_blank','noopener,noreferrer');if(w)w.opener=null;})('${p.url}')">Open</button>
          <button class="btn" onclick="(function(url){const w=window.open(url,'_blank','noopener,noreferrer');if(w)w.opener=null;})('#/summary/${p.id}')">Summarize</button>
        </td>
      </tr>
    `).join('');
  }

  async function runSearch(){
    const st = getState();
    let list = await searchPublications(st.q, st.sections, st.years);
    if (st.authors) list = list.filter(p => p.authors.join(' ').toLowerCase().includes(st.authors));
    if (st.source)  list = list.filter(p => (p.source||'').toLowerCase().includes(st.source));
    if (st.quick)   list = list.filter(p => (p.title + ' ' + p.abstract).toLowerCase().includes(st.quick));
    if (st.sort==='year_desc') list.sort((a,b)=> b.year-a.year);
    if (st.sort==='year_asc')  list.sort((a,b)=> a.year-b.year);

    count.textContent = `${list.length} results`;
    renderRows(list);
  }

  min.addEventListener('input', ()=> ylbl.textContent = `${min.value} – ${max.value}`);
  max.addEventListener('input', ()=> ylbl.textContent = `${min.value} – ${max.value}`);
  run.addEventListener('click', runSearch);
  quick.addEventListener('input', runSearch);
}
