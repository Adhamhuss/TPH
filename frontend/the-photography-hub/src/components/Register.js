import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Register.css';
import Cookies from 'js-cookie';


const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'user', 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      setPasswordStrength(calculateStrength(value));
    }
  };

  const calculateStrength = (password) => {
    if (!password) return '';
    if (password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password)) {
      return 'Strong';
    }
    if (password.length >= 6) {
      return 'Moderate';
    }
    return 'Weak';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const response = await axios.post(`${API_URL}/user/register`, formData);
  
      const { token } = response.data;
  
      Cookies.set('authToken', token, { expires: 7 });
      alert('Registration successful!');
      window.location.href = '/';
    } catch (error) {
      setError(error.response?.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="register-container">
      <h2>Sign Up</h2>
      <p>Join the platform to explore amazing features!</p>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleInputChange}
          required
        />
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
        {passwordStrength && (
          <p className={`password-strength ${passwordStrength}`}>
            Password strength: {passwordStrength}
          </p>
        )}
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          required
        >
          <option value="user">User</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      <a className="link" href="/login">
        Already have an account? Log in
      </a>
    </div>
  );
};

export default Register;
