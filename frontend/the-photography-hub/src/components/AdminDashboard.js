import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css'; // CSS file for styling
import { getAuthToken } from './authUtils'; // Token handling utility

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (selectedTab === 'courses') fetchCourses();
    if (selectedTab === 'products') fetchProducts();
  }, [selectedTab]);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3001/courses', {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3001/shop/products', {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e, type) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const url = type === 'course' ? 'http://localhost:3001/courses' : 'http://localhost:3001/shop/products';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Failed to add ${type}`);
      setSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
      type === 'course' ? fetchCourses() : fetchProducts();
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="tabs">
        <button
          className={`tab ${selectedTab === 'courses' ? 'active' : ''}`}
          onClick={() => setSelectedTab('courses')}
        >
          Manage Courses
        </button>
        <button
          className={`tab ${selectedTab === 'products' ? 'active' : ''}`}
          onClick={() => setSelectedTab('products')}
        >
          Manage Products
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {successMessage && <div className="success">{successMessage}</div>}
      {loading && <div className="loading">Loading...</div>}

      <div className="form-container">
        {selectedTab === 'courses' ? (
          <form onSubmit={(e) => handleFormSubmit(e, 'course')}>
            <h3>Add Course</h3>
            <input type="text" name="courseName" placeholder="Course Name" required />
            <textarea name="description" placeholder="Course Description" />
            <input type="number" name="credits" placeholder="Credits" required />
            <input type="number" name="price" step="0.01" placeholder="Price" required />
            <button type="submit">Add Course</button>
          </form>
        ) : (
          <form onSubmit={(e) => handleFormSubmit(e, 'product')}>
            <h3>Add Product</h3>
            <input type="text" name="productName" placeholder="Product Name" required />
            <textarea name="description" placeholder="Product Description" />
            <input type="number" name="price" step="0.01" placeholder="Price" required />
            <input type="number" name="stock" placeholder="Stock" required />
            <input type="text" name="category" placeholder="Category" />
            <button type="submit">Add Product</button>
          </form>
        )}
      </div>

      <div className="data-container">
        {selectedTab === 'courses' ? (
          <ul>
            {courses.map((course) => (
              <li key={course.CourseID}>
                {course.CourseName} - ${course.Price} ({course.Credits} credits)
              </li>
            ))}
          </ul>
        ) : (
          <ul>
            {products.map((product) => (
              <li key={product.ProductID}>
                {product.ProductName} - ${product.Price} ({product.Stock} in stock)
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
