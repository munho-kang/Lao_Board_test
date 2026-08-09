// 백엔드 주소는 config.js에서 설정합니다.
const API_BASE = `${window.API_BASE_URL}/api/posts`;
const postsContainer = document.getElementById('postsContainer');
const postForm = document.getElementById('postForm');
const submitBtn = postForm.querySelector('button[type="submit"]');

async function fetchPosts() {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error('Failed to fetch posts');
  return await response.json();
}

async function createPost(postData) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    if (!response.ok) throw new Error('Failed to create post');
    return await response.json();
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

async function deletePost(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete post');
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\. /g, '. ').replace(/\.$/, '');
}

function renderPosts(posts) {
  if (posts.length === 0) {
    postsContainer.innerHTML = '<div class="empty-state">등록된 게시글이 없습니다.</div>';
    return;
  }

  postsContainer.innerHTML = posts.map(post => `
    <article class="post-card" data-id="${post.id}">
      <div class="post-header">
        <h3 class="post-title">${escapeHtml(post.title)}</h3>
        <div class="post-meta">
          <span>작성자: ${escapeHtml(post.author)}</span>
          <span>${formatDate(post.createdAt)}</span>
        </div>
      </div>
      <div class="post-content">${escapeHtml(post.content)}</div>
      <div class="post-actions">
        <button class="btn btn-danger delete-btn" data-id="${post.id}">삭제</button>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', handleDelete);
  });
}

function renderLoading() {
  postsContainer.innerHTML = `
    <div class="state-box">
      <div class="spinner"></div>
      <p>게시글을 불러오는 중입니다...</p>
      <p class="state-hint">서버가 잠들어 있었다면 깨어나는 데 최대 1분이 걸릴 수 있습니다.</p>
    </div>
  `;
}

function renderError(message, hint) {
  postsContainer.innerHTML = `
    <div class="state-box state-error">
      <p>${escapeHtml(message)}</p>
      ${hint ? `<p class="state-hint">${escapeHtml(hint)}</p>` : ''}
      <button type="button" class="btn btn-primary" id="retryBtn">다시 시도</button>
    </div>
  `;
  document.getElementById('retryBtn').addEventListener('click', loadPosts);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function handleSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(postForm);
  const postData = {
    title: formData.get('title').trim(),
    content: formData.get('content').trim(),
    author: formData.get('author').trim()
  };

  if (!postData.title || !postData.content || !postData.author) {
    alert('모든 필드를 입력해주세요.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = '등록 중...';

  try {
    await createPost(postData);
    postForm.reset();
    loadPosts();
  } catch (error) {
    alert('게시글 등록에 실패했습니다. 서버 연결을 확인해주세요.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '등록';
  }
}

async function handleDelete(e) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  
  const id = parseInt(e.target.dataset.id);
  try {
    await deletePost(id);
    loadPosts();
  } catch (error) {
    alert('삭제에 실패했습니다.');
  }
}

async function loadPosts() {
  if (!window.API_CONFIGURED) {
    renderError(
      '백엔드 주소가 아직 설정되지 않았습니다.',
      'config.js 파일을 열어 Render에서 받은 주소를 입력한 뒤 다시 푸시해주세요.'
    );
    return;
  }

  renderLoading();

  try {
    const posts = await fetchPosts();
    renderPosts(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    renderError(
      '서버에 연결하지 못했습니다.',
      '잠시 후 다시 시도해주세요. 계속 실패한다면 config.js의 주소와 Render 서비스 상태를 확인해주세요.'
    );
  }
}

postForm.addEventListener('submit', handleSubmit);

loadPosts();