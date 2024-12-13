import React, { useState, useEffect } from 'react';
import '../styles/Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('basic'); // Default filter is 'basic'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch courses from the server based on the filter
    const fetchCourses = async () => {
      try {
        const response = await fetch(`http://localhost:3001/courses?filter=${filter}`);
        const data = await response.json();
        setCourses(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, [filter]); // Rerun the effect when the filter changes

  return (
    <div className="courses-container">
      <div className="filter-container">
        <label>Filter by level:</label>
        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="basic">Basic</option>
          <option value="moderate">Moderate</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <div className="courses-list">
          {courses.map((course) => (
            <div key={course.CourseID} className="course-card">
              <h3>{course.CourseName}</h3>
              <p>{course.Description}</p>
              <p><strong>Instructor:</strong> {course.InstructorID}</p>
              <p><strong>Credits:</strong> {course.Credits}</p>
              <p><strong>Price:</strong> ${course.Price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
