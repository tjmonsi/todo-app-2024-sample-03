import Fastify from 'fastify';
import { v4 } from 'uuid';
import { saveDB, readDB, deleteItemDB } from './db.js';

export async function build () {
  const fastify = Fastify({ logger: true });

  fastify.get('/', async () => {
    return { hello: 'world' };
  });

  // CREATE TODO FUNCTIONALITY
  fastify.post('/todo', async (request, response) => {
    const { body } = request;
    const { title = null, description = null } = body;

    if (!title || !description) {
      response.status(400);
      return { error: 'Title and description are required' };
    }

    const todo = {
      id: v4(),
      title,
      description,
      completed: false,
      dateCreated: new Date().getTime(),
      dateUpdated: new Date().getTime()
    }

    await saveDB('todos', todo);

    return todo;
  });

  // READ ALL TODOS FUNCTIONALITY
  fastify.get('/todo', async () => {
    const todos = readDB('todos');
    todos.sort((todo1, todo2) => todo2.dateCreated - todo1.dateCreated);
    return todos
  })

  // READ ONE TODO FUNCTIONALITY
  fastify.get('/todo/:todoId', async (request, response) => {
    const { todoId } = request.params;
    const todo = readDB('todos', todoId);
    if (!todo) {
      response.status(404);
      return { error: 'Todo not found' };
    }
    return todo;
  });

  // UPDATE TODO FUNCTIONALITY
  fastify.patch('/todo/:todoId', async (request, response) => {
    const { body, params } = request;
    const { todoId } = params;
    const { title = null, description = null, completed = null } = body;
    const todo = readDB('todos', todoId);
    if (!todo) {
      response.status(404);
      return { error: 'Todo not found' };
    }

    if (title) todo.title = title;
    if (description) todo.description = description;
    if (completed !== null) todo.completed = completed;

    todo.dateUpdated = new Date().getTime();

    await saveDB('todos', todo);

    return todo
  })

  // DELETE TODO FUNCTIONALITY
  fastify.delete('/todo/:todoId', async (request, response) => {
    const { params } = request;
    const { todoId } = params;

    const todo = readDB('todos', todoId);
    if (!todo) {
      response.status(404);
      return { error: 'Todo not found' };
    }

    deleteItemDB('todos', todoId);
    return {
      success: true
    }
  });

  return fastify;
}