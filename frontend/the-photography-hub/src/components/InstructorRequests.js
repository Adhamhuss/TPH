import React, { useState } from 'react';
import axios from 'axios';

function InstructorRequests() {
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');

  // You can retrieve the instructorId from user session or JWT token if it's available
  const instructorId = 1;  // This should be dynamically set based on the logged-in user.

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:3001/instructor/request-course',
        { instructorId, courseName, description },
        { withCredentials: true } // Sending cookies for authentication
      );
      if (response.status === 200) {
        alert('Course request submitted successfully');
      }
    } catch (error) {
      console.error('Error submitting course request:', error);
      alert('Error submitting course request.');
    }
  };

  return (
    <div>
      <h1>Request a Course</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Course Name:</label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
}

export default InstructorRequests;
