export function renderProfile(container) {
  container.innerHTML = `
    <div class="panel">
      <h1 class="page-title">Profile</h1>
      <p class="muted">Welcome to your learning dashboard!</p>

      <div style="margin-top:32px;">
        <div class="profile-section">
          <h3 style="font-size:18px; margin-bottom:12px;">Learning Dashboard</h3>
          <p>Track your progress, earn badges, and continue your learning journey.</p>
        </div>

        <div class="profile-section" style="margin-top:32px;">
          <h3 style="font-size:18px; margin-bottom:12px;">Quick Links</h3>
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <a href="#/learn" class="btn">Go to Learning Hub</a>
            <a href="#/learn#progress" class="btn">View My Progress</a>
            <a href="#/learn#badges" class="btn">View My Badges</a>
          </div>
        </div>
      </div>
    </div>
  `;
}
