import { learningAPI } from './api-client.js';

export async function renderLesson(container, topicId, level) {
  container.innerHTML = `
    <div class="panel">
      <a href="#/learn/${topicId}" class="back-link">← Back to Topic</a>
      <div id="lessonContent" class="loading">
        <div class="spinner"></div>
      </div>
    </div>
  `;

  try {
    const lesson = await learningAPI.getLesson(topicId, level);

    const content = container.querySelector('#lessonContent');
    content.classList.remove('loading');

    const levelName = level.charAt(0).toUpperCase() + level.slice(1);

    content.innerHTML = `
      <div class="lesson-header-meta">
        <span class="level-badge">${levelName}</span>
      </div>
      <div class="lesson-content">
        ${renderContentBlocks(lesson.content.blocks)}
      </div>
      <div class="lesson-footer">
        <a href="#/learn/${topicId}/${level}/quiz" class="btn primary">Start Quiz →</a>
      </div>
    `;

  } catch (error) {
    const content = container.querySelector('#lessonContent');
    content.classList.remove('loading');
    content.innerHTML = `<p class="error-state">Failed to load lesson: ${error.message}</p>`;
  }
}

function renderContentBlocks(blocks) {
  return blocks.map(block => {
    switch (block.t) {
      case 'h2':
        return `<h2>${block.text}</h2>`;
      case 'h3':
        return `<h3>${block.text}</h3>`;
      case 'p':
        return `<p>${block.text}</p>`;
      case 'ul':
        return `<ul>${block.items.map(item => `<li>${item}</li>`).join('')}</ul>`;
      default:
        return '';
    }
  }).join('');
}
