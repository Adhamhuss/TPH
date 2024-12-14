const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database3.db');
const bcrypt = require('bcrypt');

// Create accounts table
db.run(`
  CREATE TABLE IF NOT EXISTS accounts (
    AccountID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT NOT NULL UNIQUE,
    Password TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    FullName TEXT,
    Role TEXT DEFAULT 'user' CHECK (Role IN ('user', 'admin', 'instructor')),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error("Error creating 'accounts' table:", err.message);
  } else {
    console.log("'accounts' table created successfully");
  }
});

// Create courses table
db.run(`
  CREATE TABLE IF NOT EXISTS courses (
    CourseID INTEGER PRIMARY KEY AUTOINCREMENT,
    CourseName TEXT NOT NULL,
    Description TEXT,
    InstructorID INTEGER,
    Credits INTEGER,
    Price REAL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (InstructorID) REFERENCES accounts(AccountID)
  )
`, (err) => {
  if (err) {
    console.error("Error creating 'courses' table:", err.message);
  } else {
    console.log("'courses' table created successfully");
  }
});

// Create shop table
db.run(`
  CREATE TABLE IF NOT EXISTS shop (
    ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
    ProductName TEXT NOT NULL,
    Description TEXT,
    Price REAL NOT NULL,
    Stock INTEGER NOT NULL,
    Category TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error("Error creating 'shop' table:", err.message);
  } else {
    console.log("'shop' table created successfully");
  }
});

// Create instructor_requests table
db.run(`
  CREATE TABLE IF NOT EXISTS instructor_requests (
    RequestID INTEGER PRIMARY KEY AUTOINCREMENT,
    AccountID INTEGER NOT NULL,
    RequestText TEXT NOT NULL,
    Status TEXT DEFAULT 'pending' CHECK (Status IN ('pending', 'approved', 'rejected')),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AccountID) REFERENCES accounts(AccountID)
  )
`, (err) => {
  if (err) {
    console.error("Error creating 'instructor_requests' table:", err.message);
  } else {
    console.log("'instructor_requests' table created successfully");
  }
});

// Create cart table
db.run(`
  CREATE TABLE IF NOT EXISTS cart (
    CartItemID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    ProductID INTEGER NOT NULL,
    Quantity INTEGER NOT NULL,
    FOREIGN KEY (UserID) REFERENCES accounts(AccountID),
    FOREIGN KEY (ProductID) REFERENCES shop(ProductID)
  )
`, (err) => {
  if (err) {
    console.error("Error creating 'cart' table:", err.message);
  } else {
    console.log("'cart' table created successfully");
  }
});

// Create tokens table
db.run(`
  CREATE TABLE IF NOT EXISTS tokens (
    TokenID INTEGER PRIMARY KEY AUTOINCREMENT,
    Token TEXT NOT NULL,
    UserID INTEGER NOT NULL,
    Expiration DATETIME NOT NULL,
    FOREIGN KEY (UserID) REFERENCES accounts(AccountID)
  )
`, (err) => {
  if (err) {
    console.error("Error creating 'tokens' table:", err.message);
  } else {
    console.log("'tokens' table created successfully");
  }
});
