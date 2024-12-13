import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Navbar.css'; // Import the CSS file for styling
import Cookies from 'js-cookie';

function Navbar() {
  const isLoggedIn = Cookies.get('authToken');
  const isAdmin = Cookies.get('authLevel') === 'admin';
  const isInstructor = Cookies.get('authLevel') === 'instructor';

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h1>The Photography Hub</h1>
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink exact to="/" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/shop" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Shop
          </NavLink>
        </li>
        {isInstructor && (
          <li>
            <NavLink to="/instructor/request-course" className={({ isActive }) => (isActive ? 'active-link' : '')}>
              Request Course
            </NavLink>
          </li>
        )}
        {isAdmin && (
          <li>
            <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'active-link' : '')}>
              Admin Dashboard
            </NavLink>
          </li>
        )}
        {isLoggedIn ? (
          <li>
            <NavLink to="/logout" className={({ isActive }) => (isActive ? 'active-link' : '')}>
              Logout
            </NavLink>
          </li>
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