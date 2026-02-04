const express = require('express');
const router = express.Router();
const { readUsers, writeUser } = require('../utils/fileUtils');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Validate username format (no colons allowed as it's used as delimiter)
    if (username.includes(':')) {
      return res.status(400).json({ error: 'Username cannot contain colons' });
    }
    
    // Only allow admin creation through direct file manipulation for security
    // Regular registration creates users with 'user' role
    const userRole = role === 'admin' ? 'user' : (role || 'user');
    
    const user = await writeUser(username, password, userRole);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(409).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const users = await readUsers();
    const user = users[username];
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    res.json({
      message: 'Login successful',
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

module.exports = router;

