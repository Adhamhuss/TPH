import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Shop.css'; 

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3002/shop/products', { withCredentials: true });
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products. Please try again.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="shop-container">
      <h1>Shop</h1>
      {loading && <p className="loading-message">Loading products...</p>}
      {error && <p className="error-message">{error}</p>}
      <ul className="product-list">
        {!loading && !error && products.map((product) => (
          <li key={product.ProductID} className="product-card">
            <h3>{product.ProductName}</h3>
            <p>{product.Description}</p>
            <p className="product-price">${product.Price.toFixed(2)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Shop;
