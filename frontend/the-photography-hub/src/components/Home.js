import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Home.css';

const Home = () => {
  const [courses, setCourses] = useState([]); // State to hold the courses data
  const [loading, setLoading] = useState(true); // Loading state to show while fetching data
  const [error, setError] = useState(''); // Error state to handle any issues with fetching

  useEffect(() => {
    // Fetch courses data from the backend when the component mounts
    axios.get('http://localhost:3001/courses')
      .then(response => {
        setCourses(response.data); // Set courses state with the fetched data
        setLoading(false); // Set loading to false when data is fetched
      })
      .catch(error => {
        setError('Failed to load courses. Please try again later.');
        setLoading(false);
      });
  }, []); // Empty dependency array means this effect runs once when the component mounts

  return (
    <div>
      <section className="hero">
        <div>
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
          <p>Loading courses...</p> // Display loading message while fetching
        ) : error ? (
          <p>{error}</p> // Display error message if fetching fails
        ) : (
          <div className="workshop-cards">
            {courses.map(course => (
              <div className="workshop-card" key={course.CourseID}>
                <h3>{course.CourseName}</h3>
                <p>{course.Description}</p>
                <p><strong>Instructor ID:</strong> {course.InstructorID}</p>
                <p><strong>Credits:</strong> {course.Credits}</p>
                <p><strong>Price:</strong> ${course.Price.toFixed(2)}</p>
                <p><strong>Created At:</strong> {new Date(course.CreatedAt).toLocaleDateString()}</p>
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
