import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/user/login', formData);
      const { token, authLevel } = response.data;

      // Save token and auth level in cookies
      Cookies.set('authToken', token, { expires: 7 });
      Cookies.set('authLevel', authLevel, { expires: 7 });

      alert('Login successful!');
      window.location.href = '/home'; // Redirect to dashboard or home
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <h2>Log In</h2>
      <p>Welcome back! Please log in to your account.</p>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Log In</button>
      </form>
      <a className="link" href="/register">
        Don't have an account? Sign up
      </a>
    </div>
  );
};

export default Login;
