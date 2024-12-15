import React, { useState } from 'react';
import axios from 'axios';
import '../styles/InstructorRequests.css';
import { getAuthToken } from './authUtils';

function InstructorRequests() {
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState('');
  const [price, setPrice] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:3002/instructor/request-course',
        {
          courseName,
          description,
          credits: parseInt(credits, 10),
          price: parseFloat(price),
        },
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      if (response.status === 200) {
        setSuccessMessage('Course request submitted successfully!');
        setCourseName('');
        setDescription('');
        setCredits('');
        setPrice('');
        setTimeout(() => setSuccessMessage(''), 5000); // Hides the message after 5 seconds
      }
    } catch (error) {
      console.error('Error submitting course request:', error);
      alert('Error submitting course request.');
    }
  };

  return (
    <div className="request-container">
      <h1>Request a Course</h1>
      {successMessage && <div className="success-message">{successMessage}</div>}
      <form onSubmit={handleSubmit} className="form-container">
        <label>Course Name:</label>
        <input
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          required
        />
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <label>Credits:</label>
        <input
          type="number"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          required
        />
        <label>Price:</label>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
}

export default InstructorRequests;

