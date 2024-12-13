import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register.js';
import Shop from './components/Shop';
import InstructorRequests from './components/InstructorRequests';
import AdminDashboard from './components/AdminDashboard';
import PrivateRoute from './components/privateroute.js';
import Navbar from './components/Navbar';
import Courses from './components/Courses';


function App() {
  return (
    <Router>
      <div>
        <Navbar /> {/* This should always render */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/courses" element={<Courses />} />
          <Route element={<PrivateRoute />}>
            <Route path="/instructor/request-course" element={<InstructorRequests />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
