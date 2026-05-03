const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const isAuthenticated = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      req.userEmail = decoded.email;
      return next();
    } catch (err) {
      // Token is invalid or expired, continue as unauthenticated
    }
  }
  
  // User is not authenticated
  next();
};

module.exports = { verifyToken, isAuthenticated };
