// Módulo principal
// Controla vistas y sesión.

const App = (() => {

  // Muestra una vista
  function showView(id) {
    document.querySelectorAll('.view').forEach(view => {
      const active = view.id === id;

      view.classList.toggle('hidden', !active);
      view.classList.toggle('active', active);
    });
  }

  // Acciones después del login
  function onLogin(session) {
    const username = document.getElementById('header-username');

    if (username) {
      username.textContent = `@${session.username}`;
    }

    showView('view-blog');

    if (typeof Blog !== 'undefined') {
      Blog.showList();
    }

    showToast(`Bienvenido, ${session.name}`, 'success');
  }

  // Acciones después del logout
  function onLogout() {
    showView('view-auth');

    if (typeof Auth !== 'undefined') {
      Auth.switchTab('login');
    }

    clearLoginForm();

    showToast('Sesión cerrada', 'info');
  }

  // Limpia el login
  function clearLoginForm() {
    const user = document.getElementById('login-user');
    const pass = document.getElementById('login-pass');

    if (user) user.value = '';
    if (pass) pass.value = '';
  }

  // Inicia la app
  function init() {
    const session = Auth.getSession();

    if (session) {
      onLogin(session);
      return;
    }

    showView('view-auth');
  }

  // Carga inicial
  document.addEventListener('DOMContentLoaded', init);

  return {
    onLogin,
    onLogout,
    showView
  };

})();


// Toast global
// Muestra mensajes temporales.

let toastTimer = null;

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');

  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');

  // Reinicia el tiempo
  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  // Oculta el mensaje
  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}