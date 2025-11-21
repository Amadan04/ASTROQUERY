import { authAPI, mockAuthAPI } from './auth-api.js';

const USE_MOCK = true;

export function renderLogin(container) {
  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <h1>Welcome Back</h1>
          <p class="muted">Sign in to your account</p>
        </div>

        <form id="loginForm" class="auth-form" novalidate>
          <div class="form-group">
            <label for="loginEmail">Email</label>
            <input
              type="email"
              id="loginEmail"
              name="email"
              placeholder="you@example.com"
              required
              autocomplete="email"
            />
            <span class="error-message" id="emailError"></span>
          </div>

          <div class="form-group">
            <label for="loginPassword">Password</label>
            <input
              type="password"
              id="loginPassword"
              name="password"
              placeholder="Enter your password"
              required
              autocomplete="current-password"
            />
            <span class="error-message" id="passwordError"></span>
          </div>

          <div class="form-footer">
            <a href="#/forgot-password" class="link-muted">Forgot password?</a>
          </div>

          <button type="submit" class="btn primary full-width" id="loginBtn">
            <span class="btn-text">Log In</span>
            <span class="btn-spinner" hidden>
              <span class="spinner-sm"></span>
            </span>
          </button>

          <div class="form-message" id="formMessage"></div>
        </form>

        <div class="auth-footer">
          <p class="muted">
            Don't have an account?
            <a href="#/signup" class="link-primary">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#loginForm');
  const emailInput = container.querySelector('#loginEmail');
  const passwordInput = container.querySelector('#loginPassword');
  const submitBtn = container.querySelector('#loginBtn');
  const btnText = container.querySelector('.btn-text');
  const btnSpinner = container.querySelector('.btn-spinner');
  const formMessage = container.querySelector('#formMessage');

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showError(inputId, message) {
    const errorEl = container.querySelector(`#${inputId}Error`);
    const input = container.querySelector(`#${inputId}`);

    if (errorEl && input) {
      errorEl.textContent = message;
      input.classList.add('error');
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
    }
  }

  function clearErrors() {
    container.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    container.querySelectorAll('input').forEach(input => input.classList.remove('error'));
    formMessage.textContent = '';
    formMessage.className = 'form-message';
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    btnText.hidden = loading;
    btnSpinner.hidden = !loading;

    emailInput.disabled = loading;
    passwordInput.disabled = loading;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    let hasError = false;

    if (!email) {
      showError('loginEmail', 'Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      showError('loginEmail', 'Invalid email format');
      hasError = true;
    }

    if (!password) {
      showError('loginPassword', 'Password is required');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      let result;
      if (USE_MOCK) {
        result = await mockAuthAPI('login', email, password);
      } else {
        result = await authAPI.login(email, password);
      }

      if (result.user) {
        localStorage.setItem('auth_user', JSON.stringify(result.user));
      }

      formMessage.textContent = 'Login successful! Redirecting...';
      formMessage.className = 'form-message success';

      setTimeout(() => {
        location.hash = '#/';
      }, 1000);

    } catch (error) {
      formMessage.textContent = error.message || 'Login failed. Please try again.';
      formMessage.className = 'form-message error';
      setLoading(false);
    }
  });

  emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('error')) {
      clearErrors();
    }
  });

  passwordInput.addEventListener('input', () => {
    if (passwordInput.classList.contains('error')) {
      clearErrors();
    }
  });

  setTimeout(() => {
    container.querySelector('.auth-card').classList.add('fade-in');
  }, 10);
}
