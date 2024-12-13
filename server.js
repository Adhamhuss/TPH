const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const path = require('path'); // Add path module for serving static files
const db = new sqlite3.Database('./database2.db');
const app = express();
const port = process.env.PORT || 3001;
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your React app's URL if different
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow cookies to be sent with requests
}));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Secret keys for JWT
const SECRET_KEY = 'kbefkbwfnunewuf7h3748hf7h47gh7ehg78hughfhihunf7iif5h7h74h5t7f';
const REFRESH_SECRET_KEY = 'tyg2hd84hr73h4fiub3b4ufiun43fi8348hf8h43hfi8u4fiuA';

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

// Default route for the root path
app.get('/', (req, res) => {
  res.send('Welcome to The Photography Hub API');
});

// Token refresh endpoint
app.post('/token/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).send('Access denied. No refresh token provided.');
  }

  jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send('Invalid or expired refresh token.');
    }

    if (!decoded.userId) {
      return res.status(403).send('Invalid refresh token.');
    }

    const newToken = jwt.sign({ userId: decoded.userId, isAdmin: decoded.isAdmin }, SECRET_KEY, { expiresIn: '1h' });
    res.cookie('authToken', newToken, { httpOnly: true, secure: false, sameSite: 'Strict' });
    res.status(200).send('Token refreshed successfully.');
  });
});

// User registration endpoint
app.post('/user/register', async (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    return res.status(400).send('All fields (fullName, email, password, and role) are required.');
  }

  // Validate role
  const validRoles = ['user', 'instructor', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).send('Invalid role. Role must be one of: "user", "instructor", or "admin".');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 4);

  const query = `INSERT INTO accounts (Username, Email, Password, Role) VALUES (?, ?, ?, ?)`;
  db.run(query, [sanitizeInput(fullName), sanitizeInput(email), hashedPassword, role], (err) => {
    if (err) return res.status(500).send('Registration failed: ' + err.message);
    res.status(200).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} registration successful.` });
  });
});

// User login endpoint
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

    const token = jwt.sign({ userId: user.AccountID, isAdmin: user.Role === 'admin' }, SECRET_KEY, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user.AccountID, isAdmin: user.Role === 'admin' }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

    res.cookie('authToken', token, { httpOnly: true, secure: false, sameSite: 'Strict' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'Strict' });
    res.status(200).send('Login successful');
  });
});

// Admin route: get all users
app.get('/admin/all-users', authenticateToken, (req, res) => {
  if (req.user.isAdmin !== true) {
    return res.status(403).send('Access denied.');
  }

  const query = `SELECT AccountID, Username, Email, Role, CreatedAt FROM accounts`;
  db.all(query, (err, rows) => {
    if (err) return res.status(500).send('Error retrieving users.');
    res.status(200).json(rows);
  });
});

// Fetch all courses
app.get('/courses', (req, res) => {
  const query = `SELECT * FROM courses`;
  db.all(query, (err, rows) => {
    if (err) return res.status(500).send('Error retrieving courses.');
    res.status(200).json(rows);
  });
});

// Add a new course
app.post('/courses', authenticateToken, (req, res) => {
  const { courseName, description, instructorID, credits, price } = req.body;

  if (req.user.isAdmin || req.user.isInstructor) {
    const query = `INSERT INTO courses (CourseName, Description, InstructorID, Credits, Price) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [courseName, description, instructorID, credits, price], (err) => {
      if (err) return res.status(500).send('Error adding course: ' + err.message);
      res.status(200).send('Course added successfully.');
    });
  } else {
    res.status(403).send('Access denied. Only admins or instructors can add courses.');
  }
});

// Fetch all products in the shop
app.get('/shop', (req, res) => {
  const query = `SELECT * FROM shop`;
  db.all(query, (err, rows) => {
    if (err) return res.status(500).send('Error retrieving shop products.');
    res.status(200).json(rows);
  });
});

// Add a new product to the shop
app.post('/shop', authenticateToken, (req, res) => {
  const { productName, description, price, stock, category } = req.body;

  // Validate input
  if (!productName || !description || typeof price !== 'number' || typeof stock !== 'number' || !category) {
    return res.status(400).send('Invalid input. Please provide all required fields with correct types.');
  }

  // Check if user is an admin
  if (req.user.isAdmin) {
    const query = `INSERT INTO shop (ProductName, Description, Price, Stock, Category) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [productName, description, price, stock, category], (err) => {
      if (err) {
        console.error('Error adding product:', err.message); // Log the error for debugging
        return res.status(500).send('An error occurred while adding the product.');
      }
      res.status(200).send('Product added successfully.');
    });
  } else {
    res.status(403).send('Access denied. Only admins can add products.');
  }
});


// Add a product to the cart
app.post('/cart', authenticateToken, (req, res) => {
  const { productID, quantity } = req.body;

  if (!productID || !quantity || quantity <= 0) {
    return res.status(400).send('Invalid product or quantity.');
  }

  const query = `INSERT INTO cart (UserID, ProductID, Quantity) VALUES (?, ?, ?)`;
  db.run(query, [req.user.userId, productID, quantity], function(err) {
    if (err) {
      return res.status(500).send('Error adding product to cart: ' + err.message);
    }
    res.status(200).send('Product added to cart successfully.');
  });
});

// Update the quantity of a product in the cart
app.put('/cart/:cartItemID', authenticateToken, (req, res) => {
  const { cartItemID } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).send('Invalid quantity.');
  }

  const query = `UPDATE cart SET Quantity = ? WHERE CartItemID = ? AND UserID = ?`;
  db.run(query, [quantity, cartItemID, req.user.userId], function(err) {
    if (err) {
      return res.status(500).send('Error updating cart: ' + err.message);
    }
    if (this.changes === 0) {
      return res.status(404).send('Cart item not found.');
    }
    res.status(200).send('Cart updated successfully.');
  });
});

// Remove a product from the cart
app.delete('/cart/:cartItemID', authenticateToken, (req, res) => {
  const { cartItemID } = req.params;

  const query = `DELETE FROM cart WHERE CartItemID = ? AND UserID = ?`;
  db.run(query, [cartItemID, req.user.userId], function(err) {
    if (err) {
      return res.status(500).send('Error removing product from cart: ' + err.message);
    }
    if (this.changes === 0) {
      return res.status(404).send('Cart item not found.');
    }
    res.status(200).send('Product removed from cart successfully.');
  });
});

// Fetch the cart items for a logged-in user
app.get('/cart', authenticateToken, (req, res) => {
  const query = `
    SELECT cart.CartItemID, shop.ProductName, shop.Price, cart.Quantity
    FROM cart
    JOIN shop ON cart.ProductID = shop.ProductID
    WHERE cart.UserID = ?`;
  
  db.all(query, [req.user.userId], (err, rows) => {
    if (err) {
      return res.status(500).send('Error fetching cart items: ' + err.message);
    }
    res.status(200).json(rows);
  });
});
app.delete('/admin/shop/:productId', authenticateToken, (req, res) => {
  // Ensure the user is an admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Only admins can delete products.' });
  }

  const productId = req.params.productId;

  db.run(
    `DELETE FROM shop WHERE ProductID = ?`,
    [productId],
    function (err) {
      if (err) {
        console.error('Error deleting product:', err.message);
        res.status(500).json({ message: 'Failed to delete product.' });
      } else if (this.changes === 0) {
        res.status(404).json({ message: 'Product not found.' });
      } else {
        res.status(200).json({ message: 'Product deleted successfully.' });
      }
    }
  );
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${3001}`);
});


