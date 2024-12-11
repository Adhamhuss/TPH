// auth.js
function authorize(roles = []) {
    return (req, res, next) => {
      const token = req.cookies.authToken;
      if (!token) {
        return res.status(401).send('Access denied. No token provided.');
      }
  
      jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
          return res.status(403).send('Invalid token.');
        }
  
        if (!roles.includes(decoded.isAdmin ? 'admin' : 'user')) {
          return res.status(403).send('Access denied.');
        }
  
        req.user = decoded; // Add user data to the request object
        next();
      });
    };
  }
  
  module.exports = { authorize };
  