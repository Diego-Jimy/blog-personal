// Módulo de autenticación
// Maneja usuarios y sesiones.

const Auth = (() => {

  // Claves de LocalStorage
  const USERS_KEY = 'blog_users';
  const SESSION_KEY = 'blog_session';

  // Genera id simple
  function generateId() {
    return Date.now().toString();
  }

  // Hash básico
  function hashPass(password) {
    return btoa(
      password
        .split('')
        .map((char, index) =>
          String.fromCharCode(
            char.charCodeAt(0) ^ (7 + index % 5)
          )
        )
        .join('')
    );
  }

  // Obtiene usuarios
  function getUsers() {
    try {
      return JSON.parse(
        localStorage.getItem(USERS_KEY)
      ) || [];
    } catch {
      return [];
    }
  }

  // Guarda usuarios
  function saveUsers(users) {
    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(users)
    );
  }

  // Obtiene sesión
  function getSession() {
    try {
      return JSON.parse(
        localStorage.getItem(SESSION_KEY)
      );
    } catch {
      return null;
    }
  }

  // Guarda sesión
  function saveSession(session) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(session)
    );
  }

  // Muestra error
  function setError(id, message) {
    const error = document.getElementById(id);

    if (!error) return;

    error.textContent = message;

    error.classList.toggle(
      'hidden',
      !message
    );
  }

  // Limpia errores
  function clearErrors() {
    setError('login-error', '');
    setError('register-error', '');
  }

  // Valida email
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Cambia tabs
  function switchTab(tab) {

    document
      .getElementById('form-login')
      .classList.toggle(
        'hidden',
        tab !== 'login'
      );

    document
      .getElementById('form-register')
      .classList.toggle(
        'hidden',
        tab !== 'register'
      );

    document
      .getElementById('tab-login')
      .classList.toggle(
        'active',
        tab === 'login'
      );

    document
      .getElementById('tab-register')
      .classList.toggle(
        'active',
        tab === 'register'
      );

    clearErrors();
  }

  // Registro
  function register(event) {
    event.preventDefault();

    const name = document
      .getElementById('reg-name')
      .value
      .trim();

    const email = document
      .getElementById('reg-email')
      .value
      .trim()
      .toLowerCase();

    const username = document
      .getElementById('reg-user')
      .value
      .trim()
      .toLowerCase();

    const password = document
      .getElementById('reg-pass')
      .value;

    const passwordConfirm = document
      .getElementById('reg-pass2')
      .value;

    // Valida campos
    if (
      !name ||
      !email ||
      !username ||
      !password ||
      !passwordConfirm
    ) {
      return setError(
        'register-error',
        'Completa todos los campos.'
      );
    }

    // Valida email
    if (!isValidEmail(email)) {
      return setError(
        'register-error',
        'Correo inválido.'
      );
    }

    // Valida contraseña
    if (password.length < 6) {
      return setError(
        'register-error',
        'La contraseña debe tener mínimo 6 caracteres.'
      );
    }

    // Confirma contraseña
    if (password !== passwordConfirm) {
      return setError(
        'register-error',
        'Las contraseñas no coinciden.'
      );
    }

    const users = getUsers();

    // Usuario repetido
    if (
      users.some(
        user => user.username === username
      )
    ) {
      return setError(
        'register-error',
        'Ese usuario ya existe.'
      );
    }

    // Email repetido
    if (
      users.some(
        user => user.email === email
      )
    ) {
      return setError(
        'register-error',
        'Ese correo ya está registrado.'
      );
    }

    // Nuevo usuario
    const newUser = {
      id: generateId(),
      name,
      email,
      username,
      password: hashPass(password),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    saveUsers(users);

    showToast(
      'Cuenta creada correctamente.',
      'success'
    );

    // Limpia formulario
    document
      .getElementById('form-register')
      .reset();

    // Cambia a login
    switchTab('login');

    document
      .getElementById('login-user')
      .value = username;
  }

  // Login
  function login(event) {
    event.preventDefault();

    const loginValue = document
      .getElementById('login-user')
      .value
      .trim()
      .toLowerCase();

    const password = document
      .getElementById('login-pass')
      .value;

    // Valida campos
    if (!loginValue || !password) {
      return setError(
        'login-error',
        'Completa todos los campos.'
      );
    }

    const users = getUsers();

    // Busca usuario
    const found = users.find(user =>
      (
        user.username === loginValue ||
        user.email === loginValue
      ) &&
      user.password === hashPass(password)
    );

    // Usuario incorrecto
    if (!found) {
      return setError(
        'login-error',
        'Usuario o contraseña incorrectos.'
      );
    }

    // Guarda sesión
    const session = {
      id: found.id,
      name: found.name,
      username: found.username,
      email: found.email
    };

    saveSession(session);

    showToast(
      'Inicio de sesión correcto.',
      'success'
    );

    App.onLogin(session);
  }

  // Logout
  function logout() {
    localStorage.removeItem(SESSION_KEY);

    App.onLogout();

    showToast(
      'Sesión cerrada.',
      'info'
    );
  }

  // Funciones públicas
  return {
    switchTab,
    register,
    login,
    logout,
    getSession
  };

})();