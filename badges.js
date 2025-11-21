import { learningAPI } from './api-client.js';

const mockBadges = [
  { id: 'b-t1', name: 'Immunity Master', earned: false, description: 'Complete all lessons in Immunity in Space' },
  { id: 'b-t2', name: 'Plant Biology Master', earned: false, description: 'Complete all lessons in Plant Biology' },
  { id: 'b-t3', name: 'Microgravity Master', earned: false, description: 'Complete all lessons in Microgravity Effects' },
  { id: 'b-t4', name: 'Cellular Master', earned: false, description: 'Complete all lessons in Cellular Adaptation' },
  { id: 'b-t5', name: 'Genomics Master', earned: false, description: 'Complete all lessons in Genomic Changes' },
  { id: 'b-t6', name: 'Radiation Master', earned: false, description: 'Complete all lessons in Radiation Biology' },
  { id: 'b-t7', name: 'Medicine Master', earned: false, description: 'Complete all lessons in Space Medicine' },
  { id: 'b-t8', name: 'Astrobiology Master', earned: false, description: 'Complete all lessons in Astrobiology' },
  { id: 'b-t9', name: 'Life Support Master', earned: false, description: 'Complete all lessons in Life Support Systems' },
  { id: 'b-t10', name: 'Nutrition Master', earned: false, description: 'Complete all lessons in Space Nutrition' },
  { id: 'b-3topics', name: 'Rising Scholar', earned: false, description: 'Complete 3 topics', earnedAt: null },
  { id: 'b-5topics', name: 'Advanced Scholar', earned: false, description: 'Complete 5 topics', earnedAt: null },
  { id: 'b-10topics', name: 'Space Biology Expert', earned: false, description: 'Complete all 10 topics', earnedAt: null },
];

export async function renderBadges(container) {
  container.innerHTML = `
    <div class="panel">
      <h1 class="page-title">Badges</h1>
      <p class="muted">Earn badges by completing topics and reaching milestones</p>

      <div class="badge-filters">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="earned">Earned</button>
        <button class="filter-btn" data-filter="locked">Locked</button>
      </div>

      <div id="badgesGrid" class="badges-grid loading">
        <div class="spinner"></div>
      </div>
    </div>
  `;

  try {
    const badges = await learningAPI.getBadges();

    const grid = container.querySelector('#badgesGrid');
    grid.classList.remove('loading');

    renderBadgeGrid(grid, badges, 'all');

    container.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderBadgeGrid(grid, badges, btn.dataset.filter);
      });
    });

  } catch (error) {
    const grid = container.querySelector('#badgesGrid');
    grid.classList.remove('loading');
    grid.innerHTML = `<p class="error-state">Failed to load badges: ${error.message}</p>`;
  }
}

function renderBadgeGrid(grid, badges, filter) {
  let filtered = badges;

  if (filter === 'earned') {
    filtered = badges.filter(b => b.earned);
  } else if (filter === 'locked') {
    filtered = badges.filter(b => !b.earned);
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="empty-state">No badges in this category</p>';
    return;
  }

  grid.innerHTML = filtered.map(badge => `
    <div class="badge-card card ${badge.earned ? 'earned' : 'locked'}">
      <div class="badge-icon">${badge.earned ? '🏆' : '🔒'}</div>
      <h3>${badge.name}</h3>
      <p class="badge-description">${badge.description}</p>
      ${badge.earned && badge.earnedAt ? `<span class="badge-date">Earned ${new Date(badge.earnedAt).toLocaleDateString()}</span>` : ''}
      ${badge.earned ? `<button class="btn sm" onclick="shareBadge('${badge.id}')">Share</button>` : ''}
    </div>
  `).join('');
}

window.shareBadge = function(badgeId) {
  const message = `I just earned a badge in AstroQuery! 🏆`;
  if (navigator.share) {
    navigator.share({ text: message }).catch(() => {});
  } else {
    alert('Badge sharing: ' + message);
  }
};
