export async function renderSummary(host, id){
  host.innerHTML = `
    <article class="panel">
      <h2 class="page-title">Summary</h2>
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Generating summary...</p>
      </div>
    </article>
  `;

  try {
    const response = await fetch(`http://localhost:5000/summarize/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Summary failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    host.innerHTML = `
      <article class="panel">
        <h2 class="page-title">Summary</h2>
        <div class="row" style="justify-content:space-between; align-items:flex-start;">
          <div>
            <strong style="font-size:18px;">${data.title}</strong><br/>
            <span style="opacity:.8; font-size:13px;">Publication ID: ${data.id}</span>
          </div>
          <div class="row">
            <button class="btn" onclick="navigator.clipboard.writeText(document.getElementById('sumBody')?.innerText||'')">Copy</button>
          </div>
        </div>
        <div id="sumBody" style="margin-top:20px; line-height:1.6;">
          <h3 style="margin-top:16px;">AI Summary</h3>
          <div style="opacity:0.9; white-space: pre-wrap;">${data.summary || 'No summary available.'}</div>
        </div>
        <div class="summary-actions">
          <button class="btn" onclick="location.hash='#/chat'">Open in Chat</button>
          <button class="btn" onclick="window.print()">Download .md (stub)</button>
        </div>
      </article>
    `;
  } catch (error) {
    host.innerHTML = `
      <article class="panel">
        <h2 class="page-title">Summary</h2>
        <div class="error-state">
          <p class="error-message">Failed to generate summary: ${error.message}</p>
          <button class="btn retry-btn" onclick="location.reload()">Retry</button>
        </div>
      </article>
    `;
  }
}
