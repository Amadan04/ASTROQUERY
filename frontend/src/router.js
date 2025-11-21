export function initRouter(renderHome){
  const page = document.getElementById('page');
  const results = document.getElementById('results');
  const resultsHdr = document.getElementById('resultsHdr');
  const searchLayer = document.getElementById('search-layer');

  function setActive(hash){
    document.querySelectorAll('nav a').forEach(a=>{
      const route = hash.split('?')[0];
      a.classList.toggle('active', a.hash && route.startsWith(a.hash));
    });
  }

  function setTopActive(hash){
    document.querySelectorAll('#topNav a').forEach(a=>{
      a.classList.toggle('active', hash.startsWith(a.hash));
    });
  }

  function setFabVisible(show){
    const fab = document.getElementById('fabChat');
    if (fab) fab.classList.toggle('hidden', !show);
  }

  async function renderPage(hash){
    if (hash === '#/' || hash.startsWith('#/?')){
      window.__earthShow && window.__earthShow();
      searchLayer?.classList.remove('hidden');
      page.innerHTML = '';
      window.__earthZoomInFromPage && window.__earthZoomInFromPage();
      return;
    }

    searchLayer?.classList.add('hidden');
    results?.classList.add('hidden');
    resultsHdr?.classList.add('hidden');
    window.__earthHide && window.__earthHide();

    if (hash.startsWith('#/graph')) {
      const { renderGraph } = await import('./graph.js');
      page.innerHTML = '';
      renderGraph(page);
      return;
    }
    if (hash.startsWith('#/chat')) {
      const { renderChat } = await import('./chat.js');
      page.innerHTML = '';
      renderChat(page);
      return;
    }
    if (hash.startsWith('#/summary/')) {
      const id = hash.split('/')[2];
      const { renderSummary } = await import('./summary.js');
      page.innerHTML = '';
      await renderSummary(page, id);
      return;
    }

    if (hash.startsWith('#/learn/') && hash.includes('/quiz')) {
      const parts = hash.split('/');
      const topicId = parts[2];
      const level = parts[3];
      const { renderQuiz } = await import('./quiz.js');
      page.innerHTML = '';
      renderQuiz(page, topicId, level);
      return;
    }

    if (hash.startsWith('#/learn/') && hash.includes('/results')) {
      const parts = hash.split('/');
      const topicId = parts[2];
      const level = parts[3];
      const { renderResults } = await import('./quiz.js');
      page.innerHTML = '';
      renderResults(page, topicId, level);
      return;
    }

    if (hash.match(/#\/learn\/[^\/]+\/(beginner|intermediate|advanced)$/)) {
      const parts = hash.split('/');
      const topicId = parts[2];
      const level = parts[3];
      const { renderLesson } = await import('./lesson.js');
      page.innerHTML = '';
      renderLesson(page, topicId, level);
      return;
    }

    if (hash.match(/#\/learn\/[^\/]+$/)) {
      const topicId = hash.split('/')[2];
      const { renderTopicDetail } = await import('./learn.js');
      page.innerHTML = '';
      renderTopicDetail(page, topicId);
      return;
    }

    if (hash.startsWith('#/learn')) {
      const { renderLearn } = await import('./learn.js');
      page.innerHTML = '';
      renderLearn(page);
      return;
    }

    if (hash.startsWith('#/simulator')) {
      const { renderSimulator } = await import('./simulator.js');
      page.innerHTML = '';
      renderSimulator(page);
      return;
    }

    if (hash.startsWith('#/deep-research')) {
      const { renderDeepResearch } = await import('./research.js');
      page.innerHTML = '';
      renderDeepResearch(page);
      return;
    }

    page.innerHTML = '<div class="panel"><h2 class="page-title">Not found</h2></div>';
  }

  function route(){
    const hash = location.hash || '#/';
    setActive(hash);
    setTopActive(hash);
    setFabVisible(!hash.startsWith('#/chat'));

    const wasHome = document.body.classList.contains('home');
    const isHome = (hash === '#/' || hash.startsWith('#/?'));
    document.body.classList.toggle('home', isHome);

    if (wasHome && !isHome && window.__earthZoomOutToPage){
      if (!route._leavingHome) {
        route._leavingHome = true;
        window.__earthZoomOutToPage(()=>{ route._leavingHome=false; renderPage(hash); });
        return;
      }
    }
    route._leavingHome = false;

    renderPage(hash);
  }

  window.addEventListener('hashchange', route);
  route();

  const homeLink = document.querySelector('a[href="#/"]');
  homeLink?.addEventListener('click', ()=> setTimeout(()=> document.getElementById('q')?.focus(),0));
}
