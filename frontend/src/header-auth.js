import { LocalSession } from './store.js';

export function initHeaderAuth() {
  const avatarInitials = document.getElementById('avatarInitials');

  function updateAvatar() {
    const initials = LocalSession.getUserInitials();
    if (avatarInitials) {
      avatarInitials.textContent = initials;
    }
  }

  updateAvatar();
}
