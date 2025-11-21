export function enableCardHoverTilt(selector){
  const cards = document.querySelectorAll(selector);
  cards.forEach(el=>{
    let rect = el.getBoundingClientRect();
    function enter(){ rect = el.getBoundingClientRect(); }
    function move(ev){
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const cx = x / rect.width - .5;
      const cy = y / rect.height - .5;
      el.style.setProperty('--rx', (-(cy * 8)).toFixed(2)+'deg');
      el.style.setProperty('--ry', ((cx * 10)).toFixed(2)+'deg');
    }
    function leave(){ el.style.setProperty('--rx','0deg'); el.style.setProperty('--ry','0deg'); el.style.setProperty('--elev','0px'); }
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
  });
}

const MAGNETIC = ['.btn', '.top-nav a', 'nav.bottom-nav a'];

function mountRipple(el, x, y){
  const r = document.createElement('span');
  r.className = 'ripple';
  r.style.left = x + 'px';
  r.style.top  = y + 'px';
  el.appendChild(r);
  setTimeout(()=> r.remove(), 650);
}

function bindMagnetic(el, intensity = 6){
  let rect = el.getBoundingClientRect();
  const enter = () => { rect = el.getBoundingClientRect(); };
  const move  = (e) => {
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const cx = (x/rect.width  - .5) * intensity;
    const cy = (y/rect.height - .5) * intensity;
    el.style.setProperty('--tx', cx.toFixed(2)+'px');
    el.style.setProperty('--ty', cy.toFixed(2)+'px');
  };
  const leave = () => {
    el.style.setProperty('--tx','0px'); el.style.setProperty('--ty','0px'); el.style.setProperty('--scale','1');
  };
  el.addEventListener('mouseenter', enter);
  el.addEventListener('mousemove', move);
  el.addEventListener('mouseleave', leave);
}

function bindRipple(el){
  el.addEventListener('click', (e)=>{
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) return;
    const rect = el.getBoundingClientRect();
    mountRipple(el, e.clientX - rect.left, e.clientY - rect.top);
  });
}

export function enhanceButtons(){
  const seen = new WeakSet();
  const attach = (root=document) => {
    MAGNETIC.forEach(sel=>{
      root.querySelectorAll(sel).forEach(el=>{
        if (seen.has(el)) return;
        seen.add(el);
        bindMagnetic(el);
        bindRipple(el);
      });
    });
  };
  attach();
  const mo = new MutationObserver(muts=>{
    for (const m of muts){
      m.addedNodes?.forEach(node=>{
        if (!(node instanceof HTMLElement)) return;
        attach(node);
      });
    }
  });
  mo.observe(document.body, { childList:true, subtree:true });
}
