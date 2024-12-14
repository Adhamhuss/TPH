import React, { useState, useEffect } from 'react';
import '../styles/Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('basic'); // Default filter is 'basic'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch courses from the server based on the filter
    const fetchCourses = async () => {
      try {
        const response = await fetch(`http://localhost:3001/courses?filter=${filter}`);
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
        setError('');
      } catch (err) {
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filter]); // Rerun the effect when the filter changes

  return (
    <div className="courses-container">
      <div className="filter-container">
        <label htmlFor="filter">Filter by level:</label>
        <select
          id="filter"
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
        >
          <option value="basic">Basic</option>
          <option value="moderate">Moderate</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length === 0 ? (
        <p>No courses found for the selected filter.</p>
      ) : (
        <div className="courses-list">
          {courses.map((course) => (
            <div key={course.CourseID} className="course-card">
              <h3>{course.CourseName}</h3>
              <p>{course.Description}</p>
              <p>
                <strong>Instructor:</strong> {course.InstructorName || 'Unknown'}
              </p>
              <p>
                <strong>Credits:</strong> {course.Credits}
              </p>
              <p>
                <strong>Price:</strong> ${course.Price.toFixed(2)}
              </p>
              <a href={`/courses/${course.CourseID}`} className="course-link">
                Learn More
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
