

/**
 * Retrieves the JWT token from cookies.
 * @returns {string|null} The token if available, or null if not found.
 */
export const getAuthToken = () => {
    return document.cookie.replace(/(?:(?:^|.*;\s*)authToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
  };
  
  /**
   * Clears the authentication token from cookies.
   */
  export const clearAuthToken = () => {
    document.cookie = 'authToken=; Max-Age=0; path=/;'; // Clears the cookie
  };
  
  /**
   * Stores the JWT token in cookies.
   * @param {string} token - The token to be stored.
   */
  export const setAuthToken = (token) => {
    document.cookie = `authToken=${token}; path=/; Secure; HttpOnly;`;
  };
  