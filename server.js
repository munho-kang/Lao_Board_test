const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'posts.json');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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
  console.log(`Server running at http://localhost:${PORT}`);
});