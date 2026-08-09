const API_BASE = '/api/posts';
const postsContainer = document.getElementById('postsContainer');
const postForm = document.getElementById('postForm');

async function fetchPosts() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
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

  try {
    await createPost(postData);
    postForm.reset();
    loadPosts();
  } catch (error) {
    alert('게시글 등록에 실패했습니다.');
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
  const posts = await fetchPosts();
  renderPosts(posts);
}

postForm.addEventListener('submit', handleSubmit);

loadPosts();