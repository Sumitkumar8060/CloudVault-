const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // 1. Read the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided. Authorization header is missing.' });
    }

    // 2. Extract the Bearer token
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid Authorization header format. Expected: Bearer <token>.' });
    }

    const token = parts[1];

    // 3. Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach authenticated user information to the request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    // Let the request continue to the actual route handler
    next();

  } catch (error) {
    // 5. Reject missing/invalid/expired tokens
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;