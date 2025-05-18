import LoginPresenter from '../presenters/LoginPresenter.js';

const LoginView = {
  render(container) {
    container.innerHTML = `
      <section class="auth-box">
        <h2>Login</h2>
        <form id="login-form">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" class="auth-btn">Login</button>
        </form>
        <p id="login-message" class="auth-message"></p>
        <p class="auth-toggle">Belum punya akun? <a href="#/register">Register di sini</a></p>
      </section>
    `;

    const form = container.querySelector('#login-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.email.value;
      const password = form.password.value;
      LoginPresenter.login(email, password, this); // ✅ pass `this` as the view
    });
  },

  showLoading() {
    const msg = document.getElementById('login-message');
    if (msg) msg.textContent = '🔄 Sedang login...';
  },

  showLoginSuccess(name) {
    const msg = document.getElementById('login-message');
    if (msg) msg.textContent = `✅ Selamat datang, ${name}!`;
    setTimeout(() => {
      location.hash = '#/';
    }, 1000);
  },

  showLoginError(errorMessage) {
    const msg = document.getElementById('login-message');
    if (msg) msg.textContent = `❌ Login gagal: ${errorMessage}`;
  },
};

export default LoginView;
