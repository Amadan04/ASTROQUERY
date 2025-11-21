import { learningAPI } from './api-client.js';

let currentTab = 'topics';

export async function renderLearn(container) {
  const hash = location.hash.split('#')[2] || '';
  if (hash === 'badges') currentTab = 'badges';
  else if (hash === 'progress') currentTab = 'progress';
  else currentTab = 'topics';

  container.innerHTML = `
    <div class="panel">
      <h1 class="page-title">Learning Hub</h1>
      <div class="learn-tabs">
        <button class="tab-btn ${currentTab === 'topics' ? 'active' : ''}" data-tab="topics">Topics</button>
        <button class="tab-btn ${currentTab === 'badges' ? 'active' : ''}" data-tab="badges">Badges</button>
        <button class="tab-btn ${currentTab === 'progress' ? 'active' : ''}" data-tab="progress">Progress</button>
      </div>
      <div id="learnContent"></div>
    </div>
  `;

  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      location.hash = currentTab === 'topics' ? '#/learn' : `#/learn#${currentTab}`;
      renderLearn(container);
    });
  });

  const content = container.querySelector('#learnContent');

  if (currentTab === 'topics') {
    await renderTopics(content);
  } else if (currentTab === 'badges') {
    await renderBadges(content);
  } else if (currentTab === 'progress') {
    await renderProgress(content);
  }
}

async function renderTopics(container) {
  container.innerHTML = `
    <div id="topicsGrid" class="topics-grid loading">
      <div class="spinner"></div>
    </div>
  `;

  try {
    const topics = await learningAPI.getTopics();
    console.log('Topics data:', topics); // Debug log

    const grid = container.querySelector('#topicsGrid');
    grid.classList.remove('loading');

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>No Topics Available</h3>
          <p>No lessons have been generated yet. Please contact an administrator to generate lessons.</p>
          <p><strong>Backend Status:</strong> ${topics === undefined ? 'Backend not responding' : 'Backend responding but no lessons found'}</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = topics.map(topic => {
      return `
        <a href="#/learn/${topic.id}" class="topic-card card">
          <div class="topic-icon">📚</div>
          <div class="topic-info">
            <h3>${topic.title}</h3>
            <p class="topic-description">${topic.description || 'Learn about ' + topic.title}</p>
            <div class="topic-meta">
              <span class="topic-level">${topic.level || 'All Levels'}</span>
              <span class="topic-difficulty">Difficulty: ${topic.difficulty_score || 'N/A'}</span>
            </div>
          </div>
        </a>
      `;
    }).join('');

  } catch (error) {
    const grid = container.querySelector('#topicsGrid');
    grid.classList.remove('loading');
    grid.innerHTML = `<p class="error-state">Failed to load topics: ${error.message}</p>`;
  }
}

async function renderBadges(container) {
  container.innerHTML = `
    <div class="badge-filters">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="earned">Earned</button>
      <button class="filter-btn" data-filter="locked">Locked</button>
    </div>
    <div id="badgesGrid" class="badges-grid loading">
      <div class="spinner"></div>
    </div>
  `;


  try {
    const badges = await learningAPI.getBadges();

    const grid = container.querySelector('#badgesGrid');
    grid.classList.remove('loading');

    if (!badges || badges.length === 0) {
      grid.innerHTML = '<p class="empty-state">No badges available yet. Complete lessons to earn badges!</p>';
      return;
    }

    // Check if any badges are earned
    const earnedBadges = badges.filter(b => b.earned);
    if (earnedBadges.length === 0) {
      grid.innerHTML = '<p class="empty-state">No badges earned yet. Complete lessons to earn badges!</p>';
      return;
    }

    function renderBadgeGrid(filter) {
      let filtered = badges;
      if (filter === 'earned') filtered = badges.filter(b => b.earned);
      else if (filter === 'locked') filtered = badges.filter(b => !b.earned);

      if (filtered.length === 0) {
        grid.innerHTML = '<p class="empty-state">No badges in this category</p>';
        return;
      }

      grid.innerHTML = filtered.map(badge => `
        <div class="badge-card card ${badge.earned ? 'earned' : 'locked'}">
          <div class="badge-icon">${badge.earned ? badge.icon : '🔒'}</div>
          <h3>${badge.name}</h3>
          <p class="badge-description">${badge.description}</p>
          ${badge.earned ? `<span class="badge-date">Earned!</span>` : ''}
        </div>
      `).join('');
    }

    renderBadgeGrid('all');

    container.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderBadgeGrid(btn.dataset.filter);
      });
    });

  } catch (error) {
    const grid = container.querySelector('#badgesGrid');
    grid.classList.remove('loading');
    grid.innerHTML = `<p class="error-state">Failed to load badges: ${error.message}</p>`;
  }
}

async function renderProgress(container) {
  container.innerHTML = `
    <div id="progressContent" class="loading">
      <div class="spinner"></div>
    </div>
  `;


  try {
    const progress = await learningAPI.getProgress();

    const content = container.querySelector('#progressContent');
    content.classList.remove('loading');

    // Handle case where progress is empty or malformed
    if (!progress || !progress.totals || progress.totals.totalLessons === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <h3>Progress Tracking</h3>
          <p>Complete lessons to see your progress!</p>
        </div>
      `;
      return;
    }

    const percentage = Math.round((progress.totals.completedLessons / progress.totals.totalLessons) * 100);

    content.innerHTML = `
      <div class="progress-stats">
        <div class="stat-card">
          <div class="stat-value">${progress.totals.completedLessons}/${progress.totals.totalLessons}</div>
          <div class="stat-label">Lessons Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${percentage}%</div>
          <div class="stat-label">Overall Progress</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${progress.totals.streakDays}</div>
          <div class="stat-label">Day Streak 🔥</div>
        </div>
      </div>

      <div class="global-progress">
        <h3>Overall Completion</h3>
        <div class="progress-bar-large">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
      </div>

      <div class="learning-summary">
        <h3>Learning Summary</h3>
        <p>Keep up the great work! Complete more lessons to unlock new badges and increase your streak.</p>
        <div class="motivation-text">
          <p>🔥 ${progress.totals.streakDays} day streak - Keep it up!</p>
          <p>📚 ${progress.totals.completedLessons} lessons completed</p>
        </div>
      </div>
    `;

  } catch (error) {
    const content = container.querySelector('#progressContent');
    content.classList.remove('loading');
    content.innerHTML = `<p class="error-state">Failed to load progress: ${error.message}</p>`;
  }
}

export async function renderTopicDetail(container, topicId) {
  container.innerHTML = `
    <div class="panel">
      <a href="#/learn" class="back-link">← Back to Learning Hub</a>
      <div id="topicContent" class="loading">
        <div class="spinner"></div>
      </div>
    </div>
  `;

  try {
    const topic = await learningAPI.getTopic(topicId);

    const content = container.querySelector('#topicContent');
    content.classList.remove('loading');

    content.innerHTML = `
      <h1 class="page-title">${topic.title}</h1>
      <div class="lesson-detail">
        <div class="lesson-info">
          <h3>Lesson Details</h3>
          <p><strong>Topic:</strong> ${topic.topic}</p>
          <p><strong>Level:</strong> ${topic.level}</p>
          <p><strong>Difficulty:</strong> ${topic.difficulty_score || 'N/A'}</p>
        </div>
        <div class="lesson-actions">
          <a href="#/learn/${topicId}/${topic.level}" class="btn primary">Start Lesson</a>
          <a href="#/learn/${topicId}/${topic.level}/quiz" class="btn">Take Quiz</a>
        </div>
      </div>
    `;

  } catch (error) {
    const content = container.querySelector('#topicContent');
    content.classList.remove('loading');
    content.innerHTML = `<p class="error-state">Failed to load topic: ${error.message}</p>`;
  }
}
