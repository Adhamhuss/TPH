import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../styles/Home.css';

const Home = () => {
  const [courses, setCourses] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(''); 

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = Cookies.get('authToken'); // Fetches token from cookies
        const response = await axios.get('http://localhost:3002/courses', {
          headers: { Authorization: `Bearer ${token}` }, // Include token in request
        });
        setCourses(response.data); 
        setLoading(false); 
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load courses. Please try again later.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []); 

  return (
    <div className="home-container">
      <section className="hero">
        
        <div className="page-content">
          <h1>Welcome to The Photography Hub</h1>
          <p>Learn, Explore, and Connect with Enthusiasts Like You</p>
          <button className="cta-button">Explore Now</button>
        </div>
      </section>

      <section className="about">
        <h2>About Us</h2>
        <p>
          At The Photography Hub, we aim to bring photographers together to share knowledge,
          grow their skills, and celebrate the art of photography.
        </p>
      </section>

      <section className="workshops">
        <h2>Our Workshops</h2>
        {loading ? (
          <p>Loading courses...</p> // Displays loading message while fetching
        ) : error ? (
          <p className="error-message">{error}</p> // Displays error message if fetching fails
        ) : (
          <div className="workshop-cards">
            {courses.map(course => (
              <div className="workshop-card" key={course.CourseID}>
                <h3>{course.CourseName}</h3>
                <p>{course.Description}</p>
                <p><strong>Instructor:</strong> {course.InstructorName || 'Unknown'}</p>
                <p><strong>Credits:</strong> {course.Credits}</p>
                <p><strong>Price:</strong> ${course.Price.toFixed(2)}</p>
                <p><strong>Created At:</strong> {new Date(course.CreatedAt).toLocaleDateString()}</p>
                <a href={`/courses/${course.CourseID}`} className="course-link">View Details</a>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <p>&copy; 2024 The Photography Hub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
