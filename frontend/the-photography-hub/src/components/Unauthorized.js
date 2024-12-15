import React from 'react';
import '../styles/Unauthorized.css'; 

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <h1>403 - Unauthorized</h1>
      <p>You do not have permission to view this page.</p>
      <a href="/">Go back to Home</a>
    </div>
  );
};

export default Unauthorized;