const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const db = new sqlite3.Database('./database.db');
const app = express();
const port = 8888;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

const SECRET_KEY = 'your_secret_key'; // Replace with an environment variable in production
const REFRESH_SECRET_KEY = 'your_refresh_secret_key';

// SQL Injection prevention helper
const sanitizeInput = (input) => {
  return input.replace(/['"\\;]/g, '');
};

// Middleware for token validation
const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send('Invalid or expired token.');
    }
    req.user = decoded;
    next();
  });
};

// Token refresh route
app.post('/token/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).send('Access denied. No refresh token provided.');
  }

  jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send('Invalid or expired refresh token.');
    }

    const newToken = jwt.sign({ userId: decoded.userId, isAdmin: decoded.isAdmin }, SECRET_KEY, { expiresIn: '1h' });
    res.cookie('authToken', newToken, { httpOnly: true, secure: true, sameSite: 'Strict' });
    res.status(200).send('Token refreshed successfully.');
  });
});

// User registration
app.post('/user/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send('All fields are required.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `INSERT INTO accounts (Username, Email, Password) VALUES (?, ?, ?)`;
  db.run(query, [sanitizeInput(username), sanitizeInput(email), hashedPassword], (err) => {
    if (err) return res.status(500).send('Registration failed: ' + err.message);
    res.status(200).send('Registration successful');
  });
});

// User login
app.post('/user/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  const query = `SELECT * FROM accounts WHERE Email = ?`;
  db.get(query, [sanitizeInput(email)], async (err, user) => {
    if (err || !user) {
      return res.status(401).send('Invalid email or password.');
    }

    const passwordMatch = await bcrypt.compare(password, user.Password);

    if (!passwordMatch) {
      return res.status(401).send('Invalid email or password.');
    }

    const token = jwt.sign({ userId: user.ID, isAdmin: user.IsAdmin }, SECRET_KEY, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user.ID, isAdmin: user.IsAdmin }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

    res.cookie('authToken', token, { httpOnly: true, secure: true, sameSite: 'Strict' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict' });
    res.status(200).send('Login successful');
  });
});

// Admin route: get all users
app.get('/admin/all-users', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).send('Access denied.');
  }

  const query = `SELECT ID, Username, Email FROM accounts`;
  db.all(query, (err, rows) => {
    if (err) return res.status(500).send('Error retrieving users.');
    res.status(200).json(rows);
  });
});

// Instructor requests to add a course
app.post('/instructor/request-course', authenticateToken, (req, res) => {
  const { instructorId, courseName, description } = req.body;

  if (!instructorId || !courseName || !description) {
    return res.status(400).send('All fields are required.');
  }

  const query = `INSERT INTO course_requests (InstructorID, CourseName, Description) VALUES (?, ?, ?)`;
  db.run(query, [sanitizeInput(instructorId), sanitizeInput(courseName), sanitizeInput(description)], (err) => {
    if (err) return res.status(500).send('Error submitting course request.');
    res.status(200).send('Course request submitted successfully.');
  });
});

// E-commerce: get all products
app.get('/shop/products', (req, res) => {
  const query = `SELECT * FROM shop`;
  db.all(query, (err, rows) => {
    if (err) return res.status(500).send('Error retrieving products.');
    res.status(200).json(rows);
  });
});

// E-commerce: add a product (admin only)
app.post('/admin/add-product', authenticateToken, (req, res) => {
  const { name, description, price, stock } = req.body;

  if (!req.user.isAdmin) {
    return res.status(403).send('Access denied.');
  }

  const query = `INSERT INTO shop (ProductName, Description, Price, Stock) VALUES (?, ?, ?, ?)`;
  db.run(query, [sanitizeInput(name), sanitizeInput(description), price, stock], (err) => {
    if (err) return res.status(500).send('Error adding product.');
    res.status(200).send('Product added successfully.');
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
