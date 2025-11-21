const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

export const authAPI = {
  login: async (email, password) => {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }

    return data;
  },

  signup: async (name, email, password) => {
    const data = await fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    return data;
  },

  forgotPassword: async (email) => {
    return await fetchAPI('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
};

export function mockAuthAPI(method, ...args) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (method === 'login') {
        const [email, password] = args;
        if (email && password) {
          const token = 'mock-token-' + Date.now();
          localStorage.setItem('auth_token', token);
          resolve({ token, user: { email, name: 'Test User' } });
        } else {
          reject(new Error('Invalid credentials'));
        }
      } else if (method === 'signup') {
        const [name, email, password] = args;
        if (name && email && password) {
          resolve({ message: 'Account created successfully' });
        } else {
          reject(new Error('All fields are required'));
        }
      } else if (method === 'forgotPassword') {
        resolve({ message: 'If an account exists, password reset instructions will be sent.' });
      }
    }, 800);
  });
}
