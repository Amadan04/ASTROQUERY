import { learningAPI } from './api-client.js';

let quizState = {
  questions: [],
  responses: {},
  currentIndex: 0,
  topicId: null,
  level: null,
};

export async function renderQuiz(container, topicId, level) {
  container.innerHTML = `
    <div class="panel">
      <a href="#/learn/${topicId}/${level}" class="back-link">← Back to Lesson</a>
      <div id="quizContent" class="loading">
        <div class="spinner"></div>
      </div>
    </div>
  `;

  try {
    const quiz = await learningAPI.getQuiz(topicId, level);
    console.log('Quiz data received:', quiz);
    console.log('Quiz questions:', quiz.questions);
    console.log('Quiz questions length:', quiz.questions ? quiz.questions.length : 'undefined');

    if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      const content = container.querySelector('#quizContent');
      content.classList.remove('loading');
      content.innerHTML = `
        <div class="error-state">
          <h3>No Quiz Available</h3>
          <p>No questions found for this lesson. Please contact an administrator to generate quiz questions.</p>
          <a href="#/learn/${topicId}" class="btn">Back to Lesson</a>
        </div>
      `;
      return;
    }

    quizState = {
      questions: quiz.questions,
      responses: {},
      currentIndex: 0,
      topicId,
      level,
    };

    const content = container.querySelector('#quizContent');
    content.classList.remove('loading');

    content.innerHTML = `
      <div class="quiz-header">
        <h2>Quiz: ${level.charAt(0).toUpperCase() + level.slice(1)}</h2>
        <div class="quiz-progress">
          <span id="quizProgressText">Question 1 of ${quiz.questions.length}</span>
          <div class="progress-bar">
            <div id="quizProgressBar" class="progress-fill" style="width: ${(1/quiz.questions.length)*100}%"></div>
          </div>
        </div>
      </div>
      <div id="quizQuestion" class="quiz-question"></div>
      <div class="quiz-nav">
        <button id="prevBtn" class="btn" disabled>← Previous</button>
        <button id="nextBtn" class="btn primary">Next →</button>
        <button id="submitBtn" class="btn primary" style="display:none;">Submit Quiz</button>
      </div>
    `;

    renderQuestion(content, 0);
    attachQuizHandlers(content);

  } catch (error) {
    const content = container.querySelector('#quizContent');
    content.classList.remove('loading');
    content.innerHTML = `<p class="error-state">Failed to load quiz: ${error.message}</p>`;
  }
}

function renderQuestion(container, index) {
  const question = quizState.questions[index];
  const questionEl = container.querySelector('#quizQuestion');

  console.log('Rendering question:', question);
  console.log('Question text:', question.text);
  console.log('Question choices:', question.choices);

  // All questions are multiple choice (mcq) based on backend structure
  questionEl.innerHTML = `
    <h3>Question ${index + 1}</h3>
    <p class="question-prompt">${question.text}</p>
    <div class="choices">
      ${question.choices.map((choice, i) => `
        <label class="choice-label">
          <input type="radio" name="q${index}" value="${i}" ${quizState.responses[question.id]?.responseIndex === i ? 'checked' : ''}>
          <span>${choice}</span>
        </label>
      `).join('')}
    </div>
  `;

  questionEl.querySelectorAll('input[type="radio"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const responseIndex = parseInt(e.target.value);
      console.log(`📝 User selected answer for question ${question.id}:`);
      console.log(`  - Selected value: ${e.target.value}`);
      console.log(`  - Response index: ${responseIndex}`);
      console.log(`  - Question answer: "${question.answer}"`);
      
      quizState.responses[question.id] = { responseIndex: responseIndex };
      console.log(`  - Stored response:`, quizState.responses[question.id]);
      updateNavButtons(container);
    });
  });
}

function attachQuizHandlers(container) {
  const prevBtn = container.querySelector('#prevBtn');
  const nextBtn = container.querySelector('#nextBtn');
  const submitBtn = container.querySelector('#submitBtn');

  prevBtn.addEventListener('click', () => {
    if (quizState.currentIndex > 0) {
      quizState.currentIndex--;
      renderQuestion(container, quizState.currentIndex);
      updateProgress(container);
      updateNavButtons(container);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (quizState.currentIndex < quizState.questions.length - 1) {
      quizState.currentIndex++;
      renderQuestion(container, quizState.currentIndex);
      updateProgress(container);
      updateNavButtons(container);
    }
  });

  submitBtn.addEventListener('click', async () => {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const responses = quizState.questions.map(q => {
        const resp = quizState.responses[q.id];
        // All questions are MCQ based on backend structure
        return { id: q.id, responseIndex: resp?.responseIndex ?? -1 };
      });

      const mockResult = calculateMockScore(responses);

      sessionStorage.setItem('quizResult', JSON.stringify(mockResult));
      location.hash = `#/learn/${quizState.topicId}/${quizState.level}/results`;

    } catch (error) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Quiz';
      alert(`Failed to submit quiz: ${error.message}`);
    }
  });

  updateNavButtons(container);
}

function updateProgress(container) {
  const progressText = container.querySelector('#quizProgressText');
  const progressBar = container.querySelector('#quizProgressBar');
  const current = quizState.currentIndex + 1;
  const total = quizState.questions.length;

  progressText.textContent = `Question ${current} of ${total}`;
  progressBar.style.width = `${(current / total) * 100}%`;
}

function updateNavButtons(container) {
  const prevBtn = container.querySelector('#prevBtn');
  const nextBtn = container.querySelector('#nextBtn');
  const submitBtn = container.querySelector('#submitBtn');

  prevBtn.disabled = quizState.currentIndex === 0;

  const allAnswered = quizState.questions.every(q => quizState.responses[q.id]);
  const isLastQuestion = quizState.currentIndex === quizState.questions.length - 1;

  if (isLastQuestion && allAnswered) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'inline-flex';
    submitBtn.disabled = false;
  } else {
    nextBtn.style.display = 'inline-flex';
    submitBtn.style.display = 'none';
  }
}

function calculateMockScore(responses) {
  let correct = 0;
  console.log('🔍 Calculating quiz score...');
  console.log('Responses:', responses);
  console.log('Questions:', quizState.questions);
  
  const details = responses.map((resp, i) => {
    const question = quizState.questions[i];
    let isCorrect = false;

    // Backend uses 'answer' field with letter (A, B, C, D)
    // Frontend uses responseIndex (0, 1, 2, 3)
    // Convert answer letter to index for comparison
    const answerIndex = question.answer ? question.answer.charCodeAt(0) - 65 : -1; // A=0, B=1, C=2, D=3
    
    console.log(`Question ${i + 1}:`);
    console.log(`  - Question answer (letter): "${question.answer}"`);
    console.log(`  - Converted answer index: ${answerIndex}`);
    console.log(`  - User response index: ${resp.responseIndex}`);
    console.log(`  - Is correct: ${resp.responseIndex === answerIndex}`);
    
    isCorrect = resp.responseIndex === answerIndex;

    if (isCorrect) correct++;

    return {
      id: resp.id,
      correct: isCorrect,
      explanation: question.explanation || 'No explanation available',
    };
  });

  const score = correct;
  const total = quizState.questions.length;
  const passed = (score / total) >= 0.8;

  console.log(`🎯 Final score: ${score}/${total} (${Math.round(score/total*100)}%)`);
  console.log(`✅ Passed: ${passed}`);

  return { score, total, passed, details, topicId: quizState.topicId, level: quizState.level };
}

export async function renderResults(container, topicId, level) {
  const resultData = JSON.parse(sessionStorage.getItem('quizResult') || '{}');

  if (!resultData.score && resultData.score !== 0) {
    container.innerHTML = `
      <div class="panel">
        <p class="error-state">No quiz results found. Please take the quiz first.</p>
        <a href="#/learn/${topicId}/${level}/quiz" class="btn primary">Take Quiz</a>
      </div>
    `;
    return;
  }

  const percentage = Math.round((resultData.score / resultData.total) * 100);
  const passed = resultData.passed;

  if (passed) {
    try {
      await learningAPI.updateProgress(topicId, level, true, true);
    } catch (error) {
      console.warn('Failed to update progress:', error);
    }
  }

  container.innerHTML = `
    <div class="panel">
      <div class="results-header ${passed ? 'passed' : 'failed'}">
        <div class="results-icon">${passed ? '🎉' : '📝'}</div>
        <h1>${passed ? 'Congratulations!' : 'Keep Practicing'}</h1>
        <div class="results-score">
          <span class="score-number">${resultData.score}/${resultData.total}</span>
          <span class="score-percentage">${percentage}%</span>
        </div>
        <p class="results-message">
          ${passed
            ? 'You passed! The next level is now unlocked.'
            : 'You need 80% to pass. Review the lesson and try again.'}
        </p>
      </div>

      <div class="results-details">
        <h3>Question Review</h3>
        ${resultData.details.map((detail, i) => `
          <div class="result-item ${detail.correct ? 'correct' : 'incorrect'}">
            <div class="result-header">
              <span class="result-icon">${detail.correct ? '✓' : '✗'}</span>
              <span>Question ${i + 1}</span>
            </div>
            <p class="result-explanation">${detail.explanation}</p>
          </div>
        `).join('')}
      </div>

      <div class="results-actions">
        ${passed && level === 'beginner' ? `<a href="#/learn/${topicId}/intermediate" class="btn primary">Continue to Intermediate →</a>` : ''}
        ${passed && level === 'intermediate' ? `<a href="#/learn/${topicId}/advanced" class="btn primary">Continue to Advanced →</a>` : ''}
        ${passed && level === 'advanced' ? `<a href="#/learn" class="btn primary">Back to Learning Hub</a>` : ''}
        ${!passed ? `<a href="#/learn/${topicId}/${level}/quiz" class="btn primary">Retry Quiz</a>` : ''}
        <a href="#/learn/${topicId}" class="btn">Back to Topic</a>
      </div>
    </div>
  `;

  sessionStorage.removeItem('quizResult');
}
