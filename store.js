export const LocalSession = {
  get() {
    try {
      return JSON.parse(localStorage.getItem('app_session')) || {};
    } catch {
      return {};
    }
  },

  set(patch) {
    const cur = LocalSession.get();
    const next = { ...cur, ...patch };
    localStorage.setItem('app_session', JSON.stringify(next));
    return next;
  },

  clear() {
    localStorage.removeItem('app_session');
  },

  getLastQuery() {
    return LocalSession.get().lastQuery || '';
  },

  setLastQuery(query) {
    LocalSession.set({ lastQuery: query });
  },

  getChatCollapsed() {
    return LocalSession.get().chatCollapsed || false;
  },

  setChatCollapsed(collapsed) {
    LocalSession.set({ chatCollapsed: collapsed });
  },

  getUserInitials() {
    return LocalSession.get().userInitials || 'U';
  },

  setUserInitials(initials) {
    LocalSession.set({ userInitials: initials });
  },

  getUserName() {
    return LocalSession.get().userName || 'User';
  },

  setUserName(name) {
    LocalSession.set({ userName: name });
  }
};
