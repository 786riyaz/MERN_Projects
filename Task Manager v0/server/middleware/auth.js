const { readUsers } = require('../utils/fileUtils');

// Simple authentication middleware
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Decode Basic Auth
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [username, password] = credentials.split(':');
    
    if (!username || !password) {
      return res.status(401).json({ error: 'Invalid credentials format' });
    }
    
    const users = await readUsers();
    const user = users[username];
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Attach user info to request
    req.user = {
      username: user.username,
      role: user.role
    };
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error', message: error.message });
  }
}

// Check if user is admin
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
}

module.exports = {
  authenticate,
  isAdmin
};

