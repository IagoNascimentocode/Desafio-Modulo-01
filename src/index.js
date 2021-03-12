const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAccountAlredyExists = users.find(user => user.username === username);

  if (!userAccountAlredyExists) {
    return response.status(404).json({ error: "User a not already exists" });
  }

  request.user = userAccountAlredyExists;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const task = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(task);

  return response.status(201).json(task);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const taskAlreadyExists = user.todos.find(task => task.id === id);

  if (!taskAlreadyExists) {
    return response.status(404).json({ error: "Task not found" });
  }

  taskAlreadyExists.title = title;
  taskAlreadyExists.deadline = new Date(deadline);

  return response.status(201).json(taskAlreadyExists);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const taskAlreadyExists = user.todos.find(task => task.id === id);

  if (!taskAlreadyExists) {
    return response.status(404).json({ error: "Task not found" });
  }

  taskAlreadyExists.done = true;

  return response.status(201).json(taskAlreadyExists);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const taskAlreadyExists = user.todos.find(task => task.id === id);

  if (!taskAlreadyExists) {
    return response.status(404).json({ error: "Task not found" });
  }

  user.todos.splice(user.todos.indexOf(taskAlreadyExists), 1)

  return response.status(204).send()
});

module.exports = app;