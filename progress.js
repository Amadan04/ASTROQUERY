import { learningAPI } from './api-client.js';

const mockProgress = {
  topics: [
    { topicId: 't1', beginner: false, intermediate: false, advanced: false },
    { topicId: 't2', beginner: false, intermediate: false, advanced: false },
    { topicId: 't3', beginner: false, intermediate: false, advanced: false },
    { topicId: 't4', beginner: false, intermediate: false, advanced: false },
    { topicId: 't5', beginner: false, intermediate: false, advanced: false },
    { topicId: 't6', beginner: false, intermediate: false, advanced: false },
    { topicId: 't7', beginner: false, intermediate: false, advanced: false },
    { topicId: 't8', beginner: false, intermediate: false, advanced: false },
    { topicId: 't9', beginner: false, intermediate: false, advanced: false },
    { topicId: 't10', beginner: false, intermediate: false, advanced: false },
  ],
  totals: { completedLessons: 0, totalLessons: 30, streakDays: 0 },
};

export async function renderProgress(container) {
  container.innerHTML = `
    <div class="panel">
      <h1 class="page-title">My Progress</h1>
      <div id="progressContent" class="loading">
        <div class="spinner"></div>
      </div>
    </div>
  `;

  try {
    const progress = await learningAPI.getProgress();
    const topics = await learningAPI.getTopics();

    const content = container.querySelector('#progressContent');
    content.classList.remove('loading');

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

      <div class="topic-progress-list">
        <h3>Topics Progress</h3>
        ${topics.map(topic => {
          const topicProgress = progress.topics.find(t => t.topicId === topic.id);
          if (!topicProgress) return '';

          const completed = [
            topicProgress.beginner,
            topicProgress.intermediate,
            topicProgress.advanced
          ].filter(Boolean).length;

          const nextLevel = !topicProgress.beginner ? 'beginner' :
                           !topicProgress.intermediate ? 'intermediate' :
                           !topicProgress.advanced ? 'advanced' : null;

          return `
            <div class="topic-progress-item card">
              <div class="topic-progress-info">
                <h4>${topic.title}</h4>
                <div class="topic-progress-bar">
                  <div class="progress-fill" style="width: ${(completed/3)*100}%"></div>
                </div>
                <span class="topic-progress-text">${completed}/3 lessons completed</span>
              </div>
              <div class="topic-progress-actions">
                ${nextLevel
                  ? `<a href="#/learn/${topic.id}/${nextLevel}" class="btn sm">Continue →</a>`
                  : `<span class="completed-badge">✓ Completed</span>`
                }
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

  } catch (error) {
    const content = container.querySelector('#progressContent');
    content.classList.remove('loading');
    content.innerHTML = `<p class="error-state">Failed to load progress: ${error.message}</p>`;
  }
}
