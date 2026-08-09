const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
// Render는 실행할 포트를 PORT 환경변수로 지정합니다. 하드코딩하면 배포에 실패합니다.
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'posts.json');

app.use(cors());
app.use(express.json());

// 로컬 개발 편의를 위해 프론트엔드 파일도 이 서버에서 함께 제공합니다.
// 루트 전체를 express.static으로 열면 server.js나 .env까지 노출되므로
// 공개해도 되는 파일만 명시적으로 지정합니다.
const PUBLIC_FILES = ['index.html', 'style.css', 'app.js', 'config.js', 'deploy-guide.html'];

PUBLIC_FILES.forEach(file => {
  app.get(`/${file}`, (req, res) => res.sendFile(path.join(__dirname, file)));
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

function readPosts() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writePosts(posts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
}

// 배포가 정상인지 브라우저에서 바로 확인하는 용도입니다.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', posts: readPosts().length });
});

app.get('/api/posts', (req, res) => {
  const posts = readPosts();
  res.json(posts.sort((a, b) => b.id - a.id));
});

app.post('/api/posts', (req, res) => {
  const { title, content, author } = req.body;
  if (!title || !content || !author) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const posts = readPosts();
  const newPost = {
    id: Date.now(),
    title,
    content,
    author,
    createdAt: new Date().toISOString()
  };
  posts.push(newPost);
  writePosts(posts);
  res.status(201).json(newPost);
});

app.delete('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let posts = readPosts();
  posts = posts.filter(p => p.id !== id);
  writePosts(posts);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});