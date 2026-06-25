const express = require('express');
const session = require('express-session');
const path = require('path');

const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'replace-with-secure-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use('/', authRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
