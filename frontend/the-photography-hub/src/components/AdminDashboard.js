import React, { useEffect, useState } from 'react';
import '../styles/AdminDashboard.css';
import { getAuthToken } from './authUtils';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetches Pending Requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3002/admin/requests', {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Approve or Reject a Request
  const handleAction = async (id, action) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3002/admin/requests/${id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error(`Failed to ${action} request`);
      fetchRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Courses
  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3002/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3002/shop/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete Course
  const deleteCourse = async (id) => {
    try {
      const response = await fetch(`http://localhost:3002/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!response.ok) throw new Error('Failed to delete course');
      setSuccessMessage('Course deleted successfully!');
      fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete Product
  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`http://localhost:3002/shop/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!response.ok) throw new Error('Failed to delete product');
      setSuccessMessage('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle Add Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    setLoading(true);
    setSuccessMessage('');
    setError('');
    try {
      const response = await fetch('http://localhost:3002/shop/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to add product');
      setSuccessMessage('Product added successfully!');
      fetchProducts();
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    setLoading(true);
    setSuccessMessage('');
    setError('');
    try {
      const response = await fetch('http://localhost:3002/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to add course');
      setSuccessMessage('Course added successfully!');
      fetchCourses();
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchCourses();
    fetchProducts();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>
      {error && <div className="error">{error}</div>}
      {successMessage && <div className="success">{successMessage}</div>}
      {loading && <div className="loading">Loading...</div>}

      {/* Requests Section */}
      <div className="requests-container">
        <h3>Pending Course Requests</h3>
        {requests.length === 0 ? (
          <p>No pending requests</p>
        ) : (
          requests.map((request) => (
            <div key={request.RequestID} className="request-item">
              <p>
                <strong>{request.CourseName}</strong>: {request.Description}
              </p>
              <button onClick={() => handleAction(request.RequestID, 'approve')}>Approve</button>
              <button onClick={() => handleAction(request.RequestID, 'reject')}>Reject</button>
            </div>
          ))
        )}
      </div>

      {/* Add Product Form */}
      <div className="form-container">
        <h3>Add Product</h3>
        <form onSubmit={handleAddProduct}>
          <input type="text" name="productName" placeholder="Product Name" required />
          <textarea name="description" placeholder="Product Description"></textarea>
          <input type="number" name="price" step="0.01" placeholder="Price" required />
          <input type="number" name="stock" placeholder="Stock" required />
          <input type="text" name="category" placeholder="Category" />
          <button type="submit">Add Product</button>
        </form>
      </div>

      {/* Add Course Form */}
      <div className="form-container">
        <h3>Add Course</h3>
        <form onSubmit={handleAddCourse}>
          <input type="text" name="courseName" placeholder="Course Name" required />
          <textarea name="description" placeholder="Course Description"></textarea>
          <input type="number" name="credits" placeholder="Credits" required />
          <input type="number" name="price" step="0.01" placeholder="Price" required />
          <button type="submit">Add Course</button>
        </form>
      </div>

      {/* Courses Section */}
      <div className="courses-container">
        <h3>Courses</h3>
        <ul>
          {courses.map((course) => (
            <li key={course.CourseID} className="course-item">
              {course.CourseName} - {course.Credits} credits (${course.Price})
              <button onClick={() => deleteCourse(course.CourseID)} className="delete-button">Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Products Section */}
      <div className="products-container">
        <h3>Products</h3>
        <ul>
          {products.map((product) => (
            <li key={product.ProductID} className="product-item">
              {product.ProductName} - ${product.Price} ({product.Stock} in stock)
              <button onClick={() => deleteProduct(product.ProductID)} className="delete-button">Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
