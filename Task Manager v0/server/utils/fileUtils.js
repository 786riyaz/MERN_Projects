const fs = require('fs').promises;
const path = require('path');

const AUTH_FILE = path.join(__dirname, '..', 'data', 'users.txt');
const TASKS_FILE = path.join(__dirname, '..', 'data', 'tasks.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(__dirname, '..', 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read users from text file
async function readUsers() {
  await ensureDataDirectory();
  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const users = {};
    const lines = data.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const [username, password, role] = line.split(':');
      if (username && password) {
        users[username] = {
          username,
          password,
          role: role || 'user'
        };
      }
    }
    return users;
  } catch (error) {
    // File doesn't exist, return empty object
    return {};
  }
}

// Write user to text file
async function writeUser(username, password, role = 'user') {
  await ensureDataDirectory();
  const users = await readUsers();
  
  if (users[username]) {
    throw new Error('User already exists');
  }
  
  const userLine = `${username}:${password}:${role}\n`;
  try {
    await fs.appendFile(AUTH_FILE, userLine, 'utf8');
  } catch (error) {
    await fs.writeFile(AUTH_FILE, userLine, 'utf8');
  }
  
  return { username, password, role };
}

// Read tasks from JSON file
async function readTasks() {
  await ensureDataDirectory();
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, return empty object
    return {};
  }
}

// Write tasks to JSON file
async function writeTasks(tasks) {
  await ensureDataDirectory();
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

// Get next task ID
async function getNextTaskId() {
  const tasks = await readTasks();
  const allTaskIds = [];
  
  for (const username in tasks) {
    if (tasks[username]) {
      allTaskIds.push(...tasks[username].map(task => task.id));
    }
  }
  
  return allTaskIds.length > 0 ? Math.max(...allTaskIds) + 1 : 1;
}

module.exports = {
  readUsers,
  writeUser,
  readTasks,
  writeTasks,
  getNextTaskId
};

