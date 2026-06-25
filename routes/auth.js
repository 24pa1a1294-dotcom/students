const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/signin');
  next();
}

router.get('/', (req, res) => {
  res.render('index', { userId: req.session.userId });
});

router.get('/signup', (req, res) => {
  res.render('signup', { error: null, form: {} });
});

router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.render('signup', { error: 'All fields are required.', form: req.body });
  }

  db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.render('signup', { error: 'Database error.', form: req.body });
    if (row) return res.render('signup', { error: 'Email already registered.', form: req.body });

    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) return res.render('signup', { error: 'Hashing error.', form: req.body });

      db.run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hash], function (err) {
        if (err) return res.render('signup', { error: 'Failed to create user.', form: req.body });
        req.session.userId = this.lastID;
        res.redirect('/dashboard');
      });
    });
  });
});

router.get('/signin', (req, res) => {
  res.render('signin', { error: null, form: {} });
});

router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.render('signin', { error: 'Email and password required.', form: req.body });

  db.get('SELECT id, password_hash FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.render('signin', { error: 'Database error.', form: req.body });
    if (!row) return res.render('signin', { error: 'Invalid email or password.', form: req.body });

    bcrypt.compare(password, row.password_hash, (err, matched) => {
      if (err || !matched) return res.render('signin', { error: 'Invalid email or password.', form: req.body });
      req.session.userId = row.id;
      res.redirect('/dashboard');
    });
  });
});

router.get('/dashboard', requireAuth, (req, res) => {
  db.get('SELECT id, name, email FROM users WHERE id = ?', [req.session.userId], (err, row) => {
    if (err || !row) return res.redirect('/signin');
    res.render('dashboard', { user: row });
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
