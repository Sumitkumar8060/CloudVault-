const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate the request
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are all required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // 2. Check whether the email already exists
    const [existingRows] = await pool.query(
      'SELECT id FROM User WHERE email = ? LIMIT 1',
      [email]
    );

    if (existingRows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // 3. Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create the user with a raw INSERT query
    const [result] = await pool.query(
      'INSERT INTO User (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // 7. Generate a JWT immediately, same as login does
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 5. Never return the password or password hash
    const safeUser = {
      id: result.insertId,
      name,
      email,
    };

    // 6. Return an appropriate success response
    return res.status(201).json({
      message: 'Account created successfully.',
      user: safeUser,
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Something went wrong while creating your account.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate the request
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are both required.' });
    }

    // 2. Find the user
    const [rows] = await pool.query(
      'SELECT id, name, email, password, createdAt FROM User WHERE email = ? LIMIT 1',
      [email]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 3. Compare the supplied password with the bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 4. Generate a JWT after successful authentication
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 5. Return the JWT and safe user information
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: safeUser,
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Something went wrong while logging in.' });
  }
};

const getMe = async (req, res) => {
  try {
    // req.user was attached by authMiddleware after verifying the JWT
    const { userId } = req.user;

    const [rows] = await pool.query(
      'SELECT id, name, email, createdAt FROM User WHERE id = ? LIMIT 1',
      [userId]
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user });

  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching your profile.' });
  }
};

module.exports = { register, login, getMe };

