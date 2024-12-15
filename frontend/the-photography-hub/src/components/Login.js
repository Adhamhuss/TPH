import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(''); // Error state

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3002/user/login', formData);
      const { token, authLevel } = response.data;

      // Save token and auth level in cookies
      Cookies.set('authToken', token, { expires: 7, secure: true, sameSite: 'Strict' });
      Cookies.set('authLevel', authLevel, { expires: 7, secure: true, sameSite: 'Strict' });

      // Redirect based on role
      if (authLevel === 'admin') {
        window.location.href = '/admin/dashboard';
      } else if (authLevel === 'instructor') {
        window.location.href = '/instructor/dashboard';
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Log In</h2>
      <p>Welcome back! Please log in to your account.</p>
      <form onSubmit={handleLogin}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        {error && <p className="error">{error}</p>} {/* Error message */}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <a className="link" href="/register">
        Don't have an account? Sign up
      </a>
    </div>
  );
};

export default Login;
