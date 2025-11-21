const fab   = document.getElementById('chatFab');
const popup = document.getElementById('chatPopup');
const closeBtn = document.getElementById('cpClose');
const undock = document.getElementById('cpUndock');
const thread = document.getElementById('cpThread');
const input  = document.getElementById('cpInput');
const send   = document.getElementById('cpSend');

function show(){ popup?.removeAttribute('hidden'); input?.focus(); }
function hide(){ popup?.setAttribute('hidden',''); }
function add(msg, who='bot'){
  const row = document.createElement('div'); row.className='msgrow';
  if (who==='bot'){
    row.innerHTML = `<span class="avatar"></span><div class="msg bot">${msg}<div class="time">${new Date().toLocaleTimeString()}</div></div>`;
  } else {
    row.innerHTML = `<div class="msg mine">${msg}<div class="time">${new Date().toLocaleTimeString()}</div></div>`;
  }
  thread?.appendChild(row);
  thread && (thread.scrollTop = thread.scrollHeight);
}
async function sendMsg(){
  const v = (input)?.value.trim(); if(!v) return;
  add(v,'mine'); input.value='';
  
  // Show loading state
  const loadingRow = document.createElement('div');
  loadingRow.className='msgrow';
  loadingRow.innerHTML = `<span class="avatar"></span><div class="msg bot">Thinking...<div class="time">now</div></div>`;
  thread?.appendChild(loadingRow);
  thread && (thread.scrollTop = thread.scrollHeight);
  
  try {
    const response = await fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: v }],
        k: 5
      })
    });
    
    if (!response.ok) {
      throw new Error(`Chat failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Remove loading message
    loadingRow.remove();
    
    // Add the actual response
    add(data.answer, 'bot');
    
    // Show citations if available and response is not "I don't know"
    const isDontKnowResponse = data.answer.toLowerCase().includes("i don't know") || 
                               data.answer.toLowerCase().includes("i do not know") ||
                               data.answer.toLowerCase().includes("i'm not sure") ||
                               data.answer.toLowerCase().includes("i am not sure");
    
    if (data.citations && data.citations.length > 0 && !isDontKnowResponse) {
      const citationsHtml = data.citations.map(citation => 
        `<div class="citation">
          <a href="${citation.link}" target="_blank" rel="noopener noreferrer">${citation.title}</a>
          <span class="citation-meta">${citation.journal} (${citation.year})</span>
        </div>`
      ).join('');
      
      add(`<div class="citations-section">
        <strong>Sources:</strong>
        <div class="citations">${citationsHtml}</div>
      </div>`, 'bot');
    }
    
  } catch (error) {
    // Remove loading message
    loadingRow.remove();
    add(`Sorry, I encountered an error: ${error.message}`, 'bot');
  }
}

fab?.addEventListener('click', ()=> {
  if (popup?.hasAttribute('hidden')) show(); else hide();
});
closeBtn?.addEventListener('click', hide);
undock?.addEventListener('click', ()=> { hide(); location.hash = '#/chat'; });
send?.addEventListener('click', sendMsg);
input?.addEventListener('keydown', (e)=>{
  if (e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMsg(); }
});

window.addEventListener('hashchange', ()=> {
  if (location.hash.startsWith('#/chat')) hide();
});

console.log('✅ Chat pop-up mounted');
