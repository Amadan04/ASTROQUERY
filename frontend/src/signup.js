import { authAPI, mockAuthAPI } from './auth-api.js';

const USE_MOCK = true;

export function renderSignup(container) {
  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <h1>Create Account</h1>
          <p class="muted">Join us to get started</p>
        </div>

        <form id="signupForm" class="auth-form" novalidate>
          <div class="form-group">
            <label for="signupName">Full Name</label>
            <input
              type="text"
              id="signupName"
              name="name"
              placeholder="John Doe"
              required
              autocomplete="name"
            />
            <span class="error-message" id="nameError"></span>
          </div>

          <div class="form-group">
            <label for="signupEmail">Email</label>
            <input
              type="email"
              id="signupEmail"
              name="email"
              placeholder="you@example.com"
              required
              autocomplete="email"
            />
            <span class="error-message" id="emailError"></span>
          </div>

          <div class="form-group">
            <label for="signupPassword">Password</label>
            <input
              type="password"
              id="signupPassword"
              name="password"
              placeholder="At least 8 characters"
              required
              minlength="8"
              autocomplete="new-password"
            />
            <span class="error-message" id="passwordError"></span>
          </div>

          <div class="form-group">
            <label for="signupConfirmPassword">Confirm Password</label>
            <input
              type="password"
              id="signupConfirmPassword"
              name="confirmPassword"
              placeholder="Re-enter your password"
              required
              autocomplete="new-password"
            />
            <span class="error-message" id="confirmPasswordError"></span>
          </div>

          <button type="submit" class="btn primary full-width" id="signupBtn">
            <span class="btn-text">Create Account</span>
            <span class="btn-spinner" hidden>
              <span class="spinner-sm"></span>
            </span>
          </button>

          <div class="form-message" id="formMessage"></div>
        </form>

        <div class="auth-footer">
          <p class="muted">
            Already have an account?
            <a href="#/login" class="link-primary">Log in</a>
          </p>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#signupForm');
  const nameInput = container.querySelector('#signupName');
  const emailInput = container.querySelector('#signupEmail');
  const passwordInput = container.querySelector('#signupPassword');
  const confirmPasswordInput = container.querySelector('#signupConfirmPassword');
  const submitBtn = container.querySelector('#signupBtn');
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

    nameInput.disabled = loading;
    emailInput.disabled = loading;
    passwordInput.disabled = loading;
    confirmPasswordInput.disabled = loading;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    let hasError = false;

    if (!name) {
      showError('signupName', 'Name is required');
      hasError = true;
    }

    if (!email) {
      showError('signupEmail', 'Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      showError('signupEmail', 'Invalid email format');
      hasError = true;
    }

    if (!password) {
      showError('signupPassword', 'Password is required');
      hasError = true;
    } else if (password.length < 8) {
      showError('signupPassword', 'Password must be at least 8 characters');
      hasError = true;
    }

    if (!confirmPassword) {
      showError('signupConfirmPassword', 'Please confirm your password');
      hasError = true;
    } else if (password !== confirmPassword) {
      showError('signupConfirmPassword', 'Passwords do not match');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      let result;
      if (USE_MOCK) {
        result = await mockAuthAPI('signup', name, email, password);
      } else {
        result = await authAPI.signup(name, email, password);
      }

      formMessage.textContent = 'Account created successfully! Redirecting to login...';
      formMessage.className = 'form-message success';

      setTimeout(() => {
        location.hash = '#/login';
      }, 1500);

    } catch (error) {
      formMessage.textContent = error.message || 'Signup failed. Please try again.';
      formMessage.className = 'form-message error';
      setLoading(false);
    }
  });

  const inputs = [nameInput, emailInput, passwordInput, confirmPasswordInput];
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        clearErrors();
      }
    });
  });

  setTimeout(() => {
    container.querySelector('.auth-card').classList.add('fade-in');
  }, 10);
}
