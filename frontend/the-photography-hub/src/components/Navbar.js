import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import Cookies from 'js-cookie';
import '../styles/Navbar.css'; // Import the CSS file for styling
import logo from '../l.png';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [userInfo, setUserInfo] = useState({ username: '', role: '' });

  const navigate = useNavigate();

  // Fetch and decode the JWT token to extract username and role
  useEffect(() => {
    const authToken = Cookies.get('authToken');
    if (authToken) {
      try {
        const decoded = jwtDecode(authToken);
        setUserInfo({ username: decoded.username || 'User', role: decoded.role });
      } catch (error) {
        console.error('Error decoding token:', error);
        Cookies.remove('authToken'); // Clear invalid token
        setUserInfo({ username: '', role: '' });
      }
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    Cookies.remove('authToken');
    Cookies.remove('refreshToken'); // Ensure refresh token is cleared
    Cookies.remove('username');
    setUserInfo({ username: '', role: '' });
    navigate('/login');
  };

  // Toggle hamburger menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Navbar hide/show logic with a scroll threshold
  useEffect(() => {
    const handleScroll = () => {
      const threshold = 10; // Allow small scroll differences
      if (window.scrollY > lastScrollY + threshold) {
        setIsNavbarVisible(false); // Hide navbar on significant scroll down
      } else if (window.scrollY < lastScrollY - threshold) {
        setIsNavbarVisible(true); // Show navbar on significant scroll up
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const { username, role } = userInfo;

  return (
    <nav className={`navbar ${!isNavbarVisible ? 'hidden' : ''}`}>
      <div className="logo">
        <NavLink to="/">
          <img src={logo} alt="The Photography Hub" className="logo" />
        </NavLink>
      </div>
      <button
        className="hamburger-menu"
        onClick={toggleMenu}
        aria-expanded={isMenuOpen ? 'true' : 'false'}
      >
        ☰
      </button>
      <ul className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/shop" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Shop
          </NavLink>
        </li>
        <li>
          <NavLink to="/courses" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Courses
          </NavLink>
        </li>
        {role === 'instructor' && (
          <li>
            <NavLink
              to="/instructor/request-course"
              className={({ isActive }) =>
                isActive ? 'active-link instructor-link' : 'instructor-link'
              }
            >
              Request Course
            </NavLink>
          </li>
        )}
        {role === 'admin' && (
          <li>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => (isActive ? 'active-link admin-link' : 'admin-link')}
            >
              Admin Dashboard
            </NavLink>
          </li>
        )}
        {role ? (
          <>
            <li className="user-info">
              Welcome, {username || 'User'} ({role})
            </li>
            <li>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                Register
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
