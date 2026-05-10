// Módulo de publicaciones
// Maneja CRUD de posts.

const Blog = (() => {

  // Clave de LocalStorage
  const POSTS_KEY = 'blog_posts';

  // Post actual
  let currentId = null;

  // Obtiene posts
  function getPosts() {
    try {
      return JSON.parse(
        localStorage.getItem(POSTS_KEY)
      ) || [];
    } catch {
      return [];
    }
  }

  // Guarda posts
  function savePosts(posts) {
    localStorage.setItem(
      POSTS_KEY,
      JSON.stringify(posts)
    );
  }

  // Genera id
  function generateId() {
    return Date.now().toString();
  }

  // Cambia subvista
  function showSubView(id) {

    document
      .querySelectorAll('.sub-view')
      .forEach(view => {

        view.classList.toggle(
          'hidden',
          view.id !== id
        );
      });
  }

  // Lista de posts
  function showList() {

    renderPosts();

    showSubView('sub-list');
  }

  // Abre editor
  function showEditor(id = null) {

    currentId = id;

    const form = document.getElementById('form-post');

    if (!form) return;

    // Limpia formulario
    form.reset();

    // Cambia título
    document.getElementById(
      'editor-title-label'
    ).textContent = id
      ? 'Editar entrada'
      : 'Nueva entrada';

    // Cambia texto botón
    document.getElementById(
      'save-btn'
    ).textContent = id
      ? 'Guardar cambios'
      : 'Publicar';

    // Carga datos si existe
    if (id) {

      const post = getPosts().find(
        post => post.id === id
      );

      if (!post) return;

      document.getElementById(
        'post-title'
      ).value = post.title;

      document.getElementById(
        'post-body'
      ).value = post.body;
    }

    showSubView('sub-editor');
  }

  // Guarda publicación
  function savePost(event) {
    event.preventDefault();

    const title = document
      .getElementById('post-title')
      .value
      .trim();

    const body = document
      .getElementById('post-body')
      .value
      .trim();

    // Valida campos
    if (!title || !body) {

      showToast(
        'Completa todos los campos.',
        'error'
      );

      return;
    }

    const posts = getPosts();

    const session = Auth.getSession();

    // Valida sesión
    if (!session) {

      showToast(
        'Debes iniciar sesión.',
        'error'
      );

      return;
    }

    // Editar
    if (currentId) {

      const index = posts.findIndex(
        post => post.id === currentId
      );

      if (index === -1) return;

      posts[index].title = title;
      posts[index].body = body;
      posts[index].updatedAt = new Date().toISOString();

      savePosts(posts);

      showToast(
        'Publicación actualizada.',
        'success'
      );

      showRead(currentId);

      return;
    }

    // Nuevo post
    const newPost = {
      id: generateId(),
      userId: session.id,
      author: session.name,
      title,
      body,
      date: new Date().toISOString()
    };

    posts.unshift(newPost);

    savePosts(posts);

    showToast(
      'Publicación creada.',
      'success'
    );

    showList();
  }

  // Muestra lectura
  function showRead(id) {

    const post = getPosts().find(
      post => post.id === id
    );

    if (!post) return;

    currentId = id;

    document.getElementById(
      'read-title'
    ).textContent = post.title;

    document.getElementById(
      'read-body'
    ).textContent = post.body;

    document.getElementById(
      'read-date'
    ).textContent = formatDate(post.date);

    document.getElementById(
      'read-author'
    ).textContent = `Por ${post.author}`;

    showSubView('sub-read');
  }

  // Edita post actual
  function editCurrent() {

    if (!currentId) return;

    showEditor(currentId);
  }

  // Elimina post actual
  function deleteCurrent() {

    if (!currentId) return;

    const confirmDelete = confirm(
      '¿Eliminar publicación?'
    );

    if (!confirmDelete) return;

    const posts = getPosts().filter(
      post => post.id !== currentId
    );

    savePosts(posts);

    showToast(
      'Publicación eliminada.',
      'info'
    );

    showList();
  }

  // Elimina desde tarjeta
  function deletePost(id, event) {

    event.stopPropagation();

    currentId = id;

    deleteCurrent();
  }

  // Renderiza posts
  function renderPosts() {

    const grid = document.getElementById(
      'posts-grid'
    );

    const empty = document.getElementById(
      'empty-state'
    );

    if (!grid) return;

    const posts = getPosts();

    const searchInput = document.getElementById(
      'search-posts'
    );

    const search = searchInput
      ? searchInput.value.toLowerCase()
      : '';

    const filteredPosts = posts.filter(post =>
      post.title.toLowerCase().includes(search) ||
      post.body.toLowerCase().includes(search)
    );

    // Contador
    const counter = document.getElementById(
      'posts-counter'
    );

    if (counter) {
      counter.textContent =
        `${filteredPosts.length} publicaciones`;
    }

    // Estado vacío
    if (!filteredPosts.length) {

      grid.innerHTML = '';

      empty.classList.remove('hidden');

      return;
    }

    empty.classList.add('hidden');

    // Tarjetas
    grid.innerHTML = filteredPosts.map(post => `
      <article
        class="post-card"
        onclick="Blog.showRead('${post.id}')"
      >

        <p class="card-meta">
          ${formatDate(post.date)}
        </p>

        <h3 class="card-title">
          ${escapeHtml(post.title)}
        </h3>

        <p class="card-excerpt">
          ${escapeHtml(post.body)}
        </p>

        <footer class="card-footer">

          <span class="card-read-more">
            Leer →
          </span>

          <div class="card-actions">

            <button
              class="icon-btn"
              onclick="event.stopPropagation(); Blog.showEditor('${post.id}')"
            >
              ✏️
            </button>

            <button
              class="icon-btn"
              onclick="Blog.deletePost('${post.id}', event)"
            >
              🗑️
            </button>

          </div>

        </footer>

      </article>
    `).join('');
  }

  // Formatea fecha
  function formatDate(date) {

    return new Date(date)
      .toLocaleDateString(
        'es-PE',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }
      );
  }

  // Evita HTML peligroso
  function escapeHtml(text) {

    const div = document.createElement('div');

    div.textContent = text;

    return div.innerHTML;
  }

  // Funciones públicas
  return {
    showList,
    showEditor,
    savePost,
    showRead,
    editCurrent,
    deleteCurrent,
    deletePost,
    renderPosts
  };

})();

