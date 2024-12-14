import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Shop from './components/Shop';
import InstructorRequests from './components/InstructorRequests';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';
import Courses from './components/Courses';
import Unauthorized from './components/Unauthorized'; // Create a styled Unauthorized component
import NotFound from './components/NotFound'; // Create a styled NotFound component
import { jwtDecode } from 'jwt-decode';

// Define roles in a separate utility for consistency
const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  USER: 'user',
};

function App() {
  const [auth, setAuth] = useState({ token: null, role: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAuth({ token, role: decoded.role });
      } catch {
        Cookies.remove('authToken'); // Clear invalid token
      }
    }
    setLoading(false);
  }, []);
  
  const PrivateRoute = ({ children, roles }) => {
    if (loading) {
      return <div>Loading...</div>; // Replace with a spinner or splash screen
    }

    if (!auth.token) {
      return <Navigate to="/login" />;
    }

    if (roles && !roles.includes(auth.role)) {
      return <Navigate to="/unauthorized" />;
    }

    return children;
  };

  return (
    <Router>
      <div>
        <Navbar auth={auth} setAuth={setAuth} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/courses" element={<Courses />} />

          {/* Protected Routes */}
          <Route
            path="/instructor/request-course"
            element={
              <PrivateRoute roles={[ROLES.INSTRUCTOR, ROLES.ADMIN]}>
                <InstructorRequests />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute roles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Fallback Routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
