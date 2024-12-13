// src/components/Shop.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Shop() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8888/shop/products', { withCredentials: true });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Shop</h1>
      <ul>
        {products.map((product) => (
          <li key={product.ProductID}>
            <h3>{product.ProductName}</h3>
            <p>{product.Description}</p>
            <p>${product.Price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Shop;
