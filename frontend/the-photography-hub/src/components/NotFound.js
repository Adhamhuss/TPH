import React from 'react';
import '../styles/NotFound.css'; // Create a CSS file for NotFound if needed

const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/">Return to Home</a>
    </div>
  );
};

export default NotFound;
