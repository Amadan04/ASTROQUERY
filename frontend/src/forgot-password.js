import { authAPI, mockAuthAPI } from './auth-api.js';

const USE_MOCK = true;

export function renderForgotPassword(container) {
  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <h1>Reset Password</h1>
          <p class="muted">Enter your email to receive reset instructions</p>
        </div>

        <form id="forgotPasswordForm" class="auth-form" novalidate>
          <div class="form-group">
            <label for="forgotEmail">Email</label>
            <input
              type="email"
              id="forgotEmail"
              name="email"
              placeholder="you@example.com"
              required
              autocomplete="email"
            />
            <span class="error-message" id="emailError"></span>
          </div>

          <button type="submit" class="btn primary full-width" id="forgotBtn">
            <span class="btn-text">Send Reset Link</span>
            <span class="btn-spinner" hidden>
              <span class="spinner-sm"></span>
            </span>
          </button>

          <div class="form-message" id="formMessage"></div>
        </form>

        <div class="auth-footer">
          <p class="muted">
            <a href="#/login" class="link-primary">← Back to login</a>
          </p>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#forgotPasswordForm');
  const emailInput = container.querySelector('#forgotEmail');
  const submitBtn = container.querySelector('#forgotBtn');
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
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();

    if (!email) {
      showError('forgotEmail', 'Email is required');
      return;
    }

    if (!validateEmail(email)) {
      showError('forgotEmail', 'Invalid email format');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (USE_MOCK) {
        result = await mockAuthAPI('forgotPassword', email);
      } else {
        result = await authAPI.forgotPassword(email);
      }

      formMessage.textContent = result.message || 'If an account exists, password reset instructions will be sent.';
      formMessage.className = 'form-message success';

      emailInput.value = '';
      setLoading(false);

    } catch (error) {
      formMessage.textContent = error.message || 'Failed to send reset email. Please try again.';
      formMessage.className = 'form-message error';
      setLoading(false);
    }
  });

  emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('error')) {
      clearErrors();
    }
  });

  setTimeout(() => {
    container.querySelector('.auth-card').classList.add('fade-in');
  }, 10);
}
