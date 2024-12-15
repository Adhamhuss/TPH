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
const port = process.env.PORT || 3002;

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
const SECRET_KEY = process.env.SECRET_KEY || 'hgvabhcnjlkmeihfihuw47ai4yhgf75ehg87ha4gf';
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'jacnbiuehf8w4f87hwg987pherapf9uhg98F';

const authenticateToken = (roles = []) => (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).send('Access denied. No token provided.');

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).send('Invalid or expired token.');

    req.user = decoded; // Contains id, username, and role
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).send('Access denied. Insufficient permissions.');
    }

    next();
  });
};

// Routes
app.get('/', (req, res) => res.send('Welcome to The Photography Hub API'));

// Registration Route
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

      res.cookie('authToken', token, { httpOnly: true, secure: false, sameSite: 'lax' });
      return res.status(201).send({ message: 'Registration successful.', token });
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).send('Internal server error.');
  }
});

// Login Route
app.post('/user/login', (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM accounts WHERE Email = ?`;
  db.get(query, [email], async (err, user) => {
    if (err || !user) return res.status(401).send('Invalid email or password.');

    const isValidPassword = await bcrypt.compare(password, user.Password);
    if (!isValidPassword) return res.status(401).send('Invalid email or password.');

    const token = jwt.sign(
      { id: user.AccountID, username: user.FullName, role: user.Role },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.cookie('authToken', token, { httpOnly: true, secure: false, sameSite: 'lax' });
    res.status(200).json({ message: 'Login successful.', token });
  });
});

// Logout Route
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

  if (!productName || !price || !stock) {
    return res.status(400).send('Missing required fields.');
  }

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

// Instructor Requests
app.get('/admin/requests', authenticateToken(['admin']), (req, res) => {
  const query = `SELECT * FROM instructor_requests WHERE Status = 'pending'`;
  db.all(query, (err, rows) => {
    if (err) return res.status(500).send('Failed to fetch requests.');
    res.status(200).json(rows);
  });
});

app.post('/admin/requests/:id/action', authenticateToken(['admin']), (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  if (action === 'approve') {
    const fetchRequestQuery = `SELECT * FROM instructor_requests WHERE RequestID = ?`;
    db.get(fetchRequestQuery, [id], (err, request) => {
      if (err || !request) return res.status(404).send('Request not found.');

      const { CourseName, Description, Credits, Price, AccountID: instructorID } = request;
      const insertCourseQuery = `INSERT INTO courses (CourseName, Description, Credits, Price, InstructorID) VALUES (?, ?, ?, ?, ?)`;
      db.run(insertCourseQuery, [CourseName, Description, Credits, Price, instructorID], (err) => {
        if (err) return res.status(500).send('Failed to add course.');
        db.run(`UPDATE instructor_requests SET Status = 'approved' WHERE RequestID = ?`, [id], (err) => {
          if (err) return res.status(500).send('Failed to update request status.');
          res.status(200).send('Request approved and course added.');
        });
      });
    });
  } else if (action === 'reject') {
    db.run(`UPDATE instructor_requests SET Status = 'rejected' WHERE RequestID = ?`, [id], (err) => {
      if (err) return res.status(500).send('Failed to reject request.');
      res.status(200).send('Request rejected.');
    });
  } else {
    res.status(400).send('Invalid action.');
  }
});


// Instructor Course Request
app.post('/instructor/request-course', authenticateToken(['instructor']), (req, res) => {
  const { courseName, description, credits, price } = req.body;
  const instructorID = req.user.id; // Assuming JWT payload includes user ID

  if (!courseName || !description || !credits || !price) {
    return res.status(400).send('Missing required fields.');
  }

  const query = `INSERT INTO instructor_requests (CourseName, RequestText, Credits, Price, AccountID, Status) VALUES (?, ?, ?, ?, ?, 'pending')`;
  db.run(query, [courseName, description, credits, price, instructorID], (err) => {
    if (err) {
      console.error('Database Error:', err.message);
      return res.status(500).send('Failed to submit course request.');
    }
    res.status(201).send('Course request submitted successfully.');
  });
});

// Delete a course by ID
app.delete('/courses/:id', authenticateToken(['admin']), (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM courses WHERE CourseID = ?`;
  db.run(query, [id], (err) => {
    if (err) return res.status(500).send('Error deleting course.');
    res.status(200).send('Course deleted successfully.');
  });
});

// Delete a product by ID
app.delete('/shop/products/:id', authenticateToken(['admin']), (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM shop WHERE ProductID = ?`;
  db.run(query, [id], (err) => {
    if (err) return res.status(500).send('Error deleting product.');
    res.status(200).send('Product deleted successfully.');
  });
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
