const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Task Management System API',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      tasks: {
        getAll: 'GET /api/tasks (requires Basic Auth)',
        create: 'POST /api/tasks (requires Basic Auth)',
        update: 'PUT /api/tasks/:taskId (requires Basic Auth)',
        delete: 'DELETE /api/tasks/:taskId (requires Basic Auth)'
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Task Management System API listening at http://localhost:${port}`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  POST /api/auth/register - Register a new user`);
  console.log(`  POST /api/auth/login - Login`);
  console.log(`  GET /api/tasks - Get all tasks (requires Basic Auth)`);
  console.log(`  POST /api/tasks - Create a task (requires Basic Auth)`);
  console.log(`  PUT /api/tasks/:taskId - Update a task (requires Basic Auth)`);
  console.log(`  DELETE /api/tasks/:taskId - Delete a task (requires Basic Auth)`);
});