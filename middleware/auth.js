const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ ERROR: JWT_SECRET environment variable is not defined!");
    return res.status(500).json({ error: 'JWT_SECRET environment variable is missing on the server' });
  }
  
  try {
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const isAuthenticated = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  const secret = process.env.JWT_SECRET;
  
  if (token && secret) {
    try {
      const decoded = jwt.verify(token, secret);
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
