document.addEventListener('DOMContentLoaded', function () {
    const addCourseBtn = document.getElementById('add-course-btn');
    const addProductBtn = document.getElementById('add-product-btn');
  
    const addCourseBox = document.getElementById('add-course-box');
    const addProductBox = document.getElementById('add-product-box');
  
    const loadingIndicator = document.getElementById('loading');
    const errorContainer = document.getElementById('error-container');
  
    // Hide both form containers initially
    addCourseBox.style.display = 'none';
    addProductBox.style.display = 'none';
  
    // Show the add course form when button is clicked
    addCourseBtn.addEventListener('click', function () {
      addProductBox.style.display = 'none'; // Hide product form
      addCourseBox.style.display = 'block'; // Show course form
      errorContainer.textContent = ''; // Clear error messages
    });
  
    // Show the add product form when button is clicked
    addProductBtn.addEventListener('click', function () {
      addCourseBox.style.display = 'none'; // Hide course form
      addProductBox.style.display = 'block'; // Show product form
      errorContainer.textContent = ''; // Clear error messages
    });
  
    // Handle add course form submission
    const addCourseForm = document.getElementById('add-course-form');
    addCourseForm.addEventListener('submit', function (e) {
      e.preventDefault();
  
      const courseName = document.getElementById('course-name').value;
      const courseDescription = document.getElementById('course-description').value;
      const courseCredits = document.getElementById('course-credits').value;
      const coursePrice = document.getElementById('course-price').value;
  
      if (!courseName || !courseCredits || !coursePrice) {
        errorContainer.textContent = 'Please fill in all required fields.';
        return;
      }
  
      loadingIndicator.style.display = 'block';
  
      fetch('http://localhost:3001/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getAuthToken(),
        },
        body: JSON.stringify({
          courseName,
          description: courseDescription,
          credits: courseCredits,
          price: coursePrice,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to add course');
          }
          return response.json();
        })
        .then(() => {
          alert('Course added successfully!');
          addCourseForm.reset();
        })
        .catch((err) => {
          errorContainer.textContent = err.message;
        })
        .finally(() => {
          loadingIndicator.style.display = 'none';
        });
    });
  
    // Handle add product form submission
    const addProductForm = document.getElementById('add-product-form');
    addProductForm.addEventListener('submit', function (e) {
      e.preventDefault();
  
      const productName = document.getElementById('product-name').value;
      const productDescription = document.getElementById('product-description').value;
      const productPrice = document.getElementById('product-price').value;
      const productStock = document.getElementById('product-stock').value;
      const productCategory = document.getElementById('product-category').value;
  
      if (!productName || !productPrice || !productStock) {
        errorContainer.textContent = 'Please fill in all required fields.';
        return;
      }
  
      loadingIndicator.style.display = 'block';
  
      fetch('http://localhost:3001/shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getAuthToken(),
        },
        body: JSON.stringify({
          productName,
          description: productDescription,
          price: productPrice,
          stock: productStock,
          category: productCategory,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to add product');
          }
          return response.json();
        })
        .then(() => {
          alert('Product added successfully!');
          addProductForm.reset();
        })
        .catch((err) => {
          errorContainer.textContent = err.message;
        })
        .finally(() => {
          loadingIndicator.style.display = 'none';
        });
    });
  });
  
  // Function to get JWT token for authentication
  function getAuthToken() {
    return document.cookie.replace(/(?:(?:^|.*;\s*)authToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
  }
  