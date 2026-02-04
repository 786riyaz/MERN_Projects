const express = require('express');
const router = express.Router();
const { readTasks, writeTasks, getNextTaskId } = require('../utils/fileUtils');
const { authenticate } = require('../middleware/auth');

// All task routes require authentication
router.use(authenticate);

// Get all tasks (user sees only their tasks, admin sees all)
router.get('/', async (req, res) => {
  try {
    const tasks = await readTasks();
    
    if (req.user.role === 'admin') {
      // Admin sees all tasks
      res.json({ tasks });
    } else {
      // Regular user sees only their tasks
      const userTasks = tasks[req.user.username] || [];
      res.json({ tasks: { [req.user.username]: userTasks } });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks', message: error.message });
  }
});

// Add a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, status } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    
    const tasks = await readTasks();
    const taskId = await getNextTaskId();
    
    const newTask = {
      id: taskId,
      title,
      description: description || '',
      status: status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!tasks[req.user.username]) {
      tasks[req.user.username] = [];
    }
    
    tasks[req.user.username].push(newTask);
    await writeTasks(tasks);
    
    res.status(201).json({
      message: 'Task created successfully',
      task: newTask
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task', message: error.message });
  }
});

// Edit a task
router.put('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status } = req.body;
    
    const tasks = await readTasks();
    let taskFound = false;
    let taskOwner = null;
    
    // Find the task and its owner
    for (const username in tasks) {
      if (tasks[username]) {
        const taskIndex = tasks[username].findIndex(task => task.id === parseInt(taskId));
        if (taskIndex !== -1) {
          taskOwner = username;
          taskFound = true;
          
          // Check authorization: user can only edit their own tasks, admin can edit any
          if (req.user.role !== 'admin' && req.user.username !== username) {
            return res.status(403).json({ error: 'You can only edit your own tasks' });
          }
          
          // Update task
          if (title !== undefined) tasks[username][taskIndex].title = title;
          if (description !== undefined) tasks[username][taskIndex].description = description;
          if (status !== undefined) tasks[username][taskIndex].status = status;
          tasks[username][taskIndex].updatedAt = new Date().toISOString();
          
          break;
        }
      }
    }
    
    if (!taskFound) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await writeTasks(tasks);
    
    res.json({
      message: 'Task updated successfully',
      task: tasks[taskOwner].find(task => task.id === parseInt(taskId))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task', message: error.message });
  }
});

// Delete a task
router.delete('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const tasks = await readTasks();
    let taskFound = false;
    let taskOwner = null;
    
    // Find the task and its owner
    for (const username in tasks) {
      if (tasks[username]) {
        const taskIndex = tasks[username].findIndex(task => task.id === parseInt(taskId));
        if (taskIndex !== -1) {
          taskOwner = username;
          taskFound = true;
          
          // Check authorization: user can only delete their own tasks, admin can delete any
          if (req.user.role !== 'admin' && req.user.username !== username) {
            return res.status(403).json({ error: 'You can only delete your own tasks' });
          }
          
          // Delete task
          tasks[username].splice(taskIndex, 1);
          
          // Remove user entry if no tasks left
          if (tasks[username].length === 0) {
            delete tasks[username];
          }
          
          break;
        }
      }
    }
    
    if (!taskFound) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await writeTasks(tasks);
    
    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task', message: error.message });
  }
});

module.exports = router;

