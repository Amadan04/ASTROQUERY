const API_BASE = 'http://localhost:5000';

async function fetchAPI(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`API Response for ${endpoint}:`, data); // Debug log
    return data;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
}

export const learningAPI = {
  getTopics: async () => {
    try {
      const topics = await fetchAPI('/education/lessons');
      return Array.isArray(topics) ? topics : [];
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      return []; // Return empty array as fallback
    }
  },

  getTopic: async (topicId) => {
    // Use the new backend endpoint for getting a specific lesson
    return await fetchAPI(`/education/lessons/${topicId}`);
  },

  getLesson: async (topicId, level) => {
    // Get the lesson from backend
    const lesson = await fetchAPI(`/education/lessons/${topicId}`);
    
    // Handle content from backend
    let content;
    if (lesson.content) {
      console.log('Backend content type:', typeof lesson.content);
      console.log('Backend content preview:', lesson.content.substring(0, 100));
      
      // Try to parse as JSON first
      try {
        content = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content;
        console.log('Successfully parsed content as JSON');
      } catch (error) {
        console.log('Content is not JSON, treating as plain text');
        // Content is plain text, convert to blocks format
        content = {
          blocks: [
            { t: 'h2', text: lesson.title },
            { t: 'p', text: `Topic: ${lesson.topic} | Level: ${lesson.level} | Difficulty: ${lesson.difficulty_score || 'Not specified'}` },
            { t: 'h3', text: 'Lesson Content' },
            { t: 'p', text: lesson.content }
          ]
        };
      }
    } else {
      console.log('No content from backend, using fallback');
      // No content from backend, use mock content
      content = {
        blocks: [
          { t: 'h2', text: `Welcome to ${lesson.title}` },
          { t: 'p', text: `This is a ${level} level lesson about ${lesson.topic}.` },
          { t: 'h3', text: 'Learning Objectives' },
          { t: 'ul', items: [
            'Understand the key concepts',
            'Apply knowledge in practical scenarios',
            'Complete the quiz to test understanding'
          ]},
          { t: 'h3', text: 'Lesson Content' },
          { t: 'p', text: `This lesson covers important aspects of ${lesson.topic} at the ${level} level. The difficulty score is ${lesson.difficulty_score}.` },
          { t: 'p', text: 'Take your time to read through the material and make sure you understand each concept before proceeding to the quiz.' }
        ]
      };
    }
    
    return {
      ...lesson,
      content: content
    };
  },

  getQuiz: async (topicId, level) => {
    const questions = await fetchAPI(`/education/lessons/${topicId}/questions`);
    console.log('Quiz questions received:', questions);
    console.log('Quiz questions length:', questions ? questions.length : 'undefined');
    
    // Backend returns array directly, but frontend expects { questions: [...] }
    return { questions: questions || [] };
  },

          submitQuiz: (topicId, level, responses) => {
            // Quiz submission handled locally (backend doesn't support it)
            const score = responses.score || 0;
            const passed = score >= 70; // 70% passing threshold
            
            // Update local progress
            const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
            const lessonKey = `${topicId}-${level}`;
            
            if (passed && !completedLessons.includes(lessonKey)) {
              completedLessons.push(lessonKey);
              localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
            }
            
            // Check for badge eligibility
            const totalCompleted = completedLessons.length;
            if (totalCompleted >= 1 && !localStorage.getItem('firstLessonBadge')) {
              localStorage.setItem('firstLessonBadge', 'true');
            }
            if (totalCompleted >= 5 && !localStorage.getItem('fiveLessonsBadge')) {
              localStorage.setItem('fiveLessonsBadge', 'true');
            }
            if (score === 100 && !localStorage.getItem('perfectScoreBadge')) {
              localStorage.setItem('perfectScoreBadge', 'true');
            }
            
            return Promise.resolve({ 
              status: 'ok', 
              score: score, 
              passed: passed,
              message: passed ? 'Quiz passed! Great job!' : 'Quiz not passed. Try again!'
            });
          },

          // Local storage for progress and badges (not stored in backend)
          getProgress: async () => {
            try {
              const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
              const streakDays = parseInt(localStorage.getItem('streakDays') || '0');
              
              // Get total lessons from backend
              try {
                const lessons = await fetchAPI('/education/lessons');
                const totalLessons = lessons.length;
                
                return {
                  topics: [],
                  totals: { 
                    completedLessons: completedLessons.length, 
                    totalLessons: totalLessons,
                    streakDays: streakDays 
                  }
                };
              } catch (error) {
                console.log('Backend not available, using fallback:', error);
                // Fallback if backend is not available
                return {
                  topics: [],
                  totals: { 
                    completedLessons: completedLessons.length, 
                    totalLessons: 0,
                    streakDays: streakDays 
                  }
                };
              }
            } catch (error) {
              console.error('Error in getProgress:', error);
              // Ultimate fallback
              return {
                topics: [],
                totals: { 
                  completedLessons: 0, 
                  totalLessons: 0,
                  streakDays: 0 
                }
              };
            }
          },

          updateProgress: (topicId, level, completed, quizPassed) => {
            // Update local storage
            const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
            const lessonKey = `${topicId}-${level}`;
            
            if (completed && !completedLessons.includes(lessonKey)) {
              completedLessons.push(lessonKey);
              localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
            }
            
            // Update streak
            const lastActivity = localStorage.getItem('lastActivity');
            const today = new Date().toDateString();
            if (lastActivity !== today) {
              const streakDays = parseInt(localStorage.getItem('streakDays') || '0');
              localStorage.setItem('streakDays', String(streakDays + 1));
              localStorage.setItem('lastActivity', today);
            }
            
            return Promise.resolve({ status: 'ok' });
          },

          getBadges: () => {
            // Define available badges
            const availableBadges = [
              {
                id: 'first-lesson',
                name: 'First Steps',
                description: 'Complete your first lesson',
                icon: '🎯',
                earned: localStorage.getItem('firstLessonBadge') === 'true'
              },
              {
                id: 'five-lessons',
                name: 'Scholar',
                description: 'Complete 5 lessons',
                icon: '📚',
                earned: localStorage.getItem('fiveLessonsBadge') === 'true'
              },
              {
                id: 'perfect-score',
                name: 'Perfectionist',
                description: 'Get 100% on a quiz',
                icon: '⭐',
                earned: localStorage.getItem('perfectScoreBadge') === 'true'
              },
              {
                id: 'streak-7',
                name: 'Consistent',
                description: '7-day learning streak',
                icon: '🔥',
                earned: localStorage.getItem('streak7Badge') === 'true'
              }
            ];
            
            return Promise.resolve(availableBadges);
          },

          claimBadge: (badgeId) => {
            const earnedBadges = JSON.parse(localStorage.getItem('earnedBadges') || '[]');
            if (!earnedBadges.includes(badgeId)) {
              earnedBadges.push(badgeId);
              localStorage.setItem('earnedBadges', JSON.stringify(earnedBadges));
            }
            return Promise.resolve({ status: 'ok' });
          },
};



export async function searchSemantic(params) {
  const queryParams = new URLSearchParams();

  if (params.q) queryParams.set('q', params.q);
  if (params.k) queryParams.set('k', String(params.k));
  if (params.section) queryParams.set('section', params.section.toLowerCase());
  if (params.year_from) queryParams.set('year_from', String(params.year_from));
  if (params.year_to) queryParams.set('year_to', String(params.year_to));
  if (params.journal) queryParams.set('journal', params.journal);
  if (params.restricted !== undefined) queryParams.set('restricted', params.restricted ? 'true' : 'false');
  if (params.suggestions !== undefined) queryParams.set('suggestions', params.suggestions ? 'true' : 'false');

  const response = await fetch(`${API_BASE}/semantic-search?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getInsights(pubId) {
  const response = await fetch(`${API_BASE}/insights/${pubId}`);

  if (!response.ok) {
    throw new Error(`Failed to get insights: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function analyzeResearchPaper(payload) {
  const cleaned = {
    title: payload.title?.trim(),
    sections: {}
  };

  if (payload.sections) {
    Object.entries(payload.sections).forEach(([key, value]) => {
      const trimmed = (value || '').trim();
      if (trimmed.length > 0) {
        cleaned.sections[key] = trimmed;
      }
    });
  }

  if (!cleaned.title) {
    throw new Error('Please provide a title.');
  }

  if (Object.keys(cleaned.sections).length === 0) {
    throw new Error('Please provide at least one section.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30 seconds

  try {
    const response = await fetch(`${API_BASE}/research/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleaned),
      signal: controller.signal
    });

    if (!response.ok) {
      let errorMsg = `Analysis failed (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData?.error) {
          errorMsg = errorData.error;
        } else if (errorData?.message) {
          errorMsg = errorData.message;
        }
      } catch {
        errorMsg = `Analysis failed: ${response.statusText}`;
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Graph API functions
export const graphAPI = {
  getEntities: async () => {
    console.log('🕸️ Graph: Fetching entities from backend');
    return await fetchAPI('/graph/entities');
  },

  getTriples: async () => {
    console.log('🕸️ Graph: Fetching triples from backend');
    return await fetchAPI('/graph/triples');
  },

  getStats: async () => {
    console.log('🕸️ Graph: Fetching graph stats from backend');
    return await fetchAPI('/graph/stats');
  }
};
