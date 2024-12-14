require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const db = new sqlite3.Database('./database3.db');
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// JWT Secret keys
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'default_refresh_secret_key';

// Token Middleware
const authenticateToken = (roles = []) => (req, res, next) => {
  const token = req.cookies.authToken; // Get token from cookies
  if (!token) return res.status(401).send('Access denied. No token provided.');

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).send('Invalid or expired token.');
    req.user = decoded; // Store decoded token (with role and username) in req.user

    // Check if user role matches allowed roles
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).send('Access denied. Insufficient permissions.');
    }
    next();
  });
};

// Routes
app.get('/', (req, res) => res.send('Welcome to The Photography Hub API'));

app.post('/user/register', async (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    return res.status(400).send('All fields are required.');
  }

  const validRoles = ['user', 'instructor', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).send('Invalid role.');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO accounts (FullName, Email, Password, Role, Username) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [fullName, email, hashedPassword, role, fullName], (err) => {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).send('Email or username already exists.');
        }
        return res.status(500).send('Registration failed. Please try again.');
      }

      const token = jwt.sign(
        { username: fullName, role },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.cookie('authToken', token, { httpOnly: true, secure: false, sameSite: 'Strict' });
      return res.status(201).send({ message: 'Registration successful.', token });
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).send('Internal server error.');
  }
});


app.post('/user/login', (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM accounts WHERE Email = ?`;
  db.get(query, [email], async (err, user) => {
    if (err || !user) return res.status(401).send('Invalid email or password.');

    const isValidPassword = await bcrypt.compare(password, user.Password);
    if (!isValidPassword) return res.status(401).send('Invalid email or password.');

    const token = jwt.sign(
      { username: user.FullName, role: user.Role },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.cookie('authToken', token, { httpOnly: true, secure: false, sameSite: 'Strict' });
    res.status(200).json({ message: 'Login successful.', token });
  });
});


app.post('/user/logout', (req, res) => {
  res.clearCookie('authToken');
  res.clearCookie('refreshToken');
  res.status(200).send('Logged out successfully.');
});

// Product Management
app.get('/shop/products', (req, res) => {
  const query = `SELECT * FROM shop`;
  db.all(query, (err, rows) => {
    if (err) return res.status(500).send('Error retrieving products.');
    res.status(200).json(rows);
  });
});

app.post('/shop/products', authenticateToken(['admin']), (req, res) => {
  const { productName, description, price, stock, category } = req.body;
  const query = `INSERT INTO shop (ProductName, Description, Price, Stock, Category) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [productName, description, price, stock, category], (err) => {
    if (err) return res.status(500).send('Error adding product.');
    res.status(201).send('Product added successfully.');
  });
});

// Course Management
app.get('/courses', (req, res) => {
  const query = `SELECT * FROM courses`;
  db.all(query, (err, rows) => {
    if (err) return res.status(500).send('Error retrieving courses.');
    res.status(200).json(rows);
  });
});

app.post('/courses', authenticateToken(['admin', 'instructor']), (req, res) => {
  const { courseName, description, instructorID, credits, price } = req.body;
  const query = `INSERT INTO courses (CourseName, Description, InstructorID, Credits, Price) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [courseName, description, instructorID, credits, price], (err) => {
    if (err) return res.status(500).send('Error adding course.');
    res.status(201).send('Course added successfully.');
  });
});

// Cart Management
app.get('/cart', authenticateToken(['user']), (req, res) => {
  const query = `SELECT cart.CartItemID, shop.ProductName, cart.Quantity FROM cart JOIN shop ON cart.ProductID = shop.ProductID WHERE cart.UserID = ?`;
  db.all(query, [req.user.userId], (err, rows) => {
    if (err) return res.status(500).send('Error retrieving cart items.');
    res.status(200).json(rows);
  });
});

app.post('/cart', authenticateToken(['user']), (req, res) => {
  const { productID, quantity } = req.body;
  const query = `INSERT INTO cart (UserID, ProductID, Quantity) VALUES (?, ?, ?)`;
  db.run(query, [req.user.userId, productID, quantity], (err) => {
    if (err) return res.status(500).send('Error adding to cart.');
    res.status(201).send('Item added to cart.');
  });
});

// Start Server
app.listen(port, () => console.log(`Server running on http://localhost:${3001}`));
