import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

function controllerRouting(app) {
  const router = express.Router();
  app.use('/', router);

  // App Controller

  // Check Redis and DB status
  router.get('/status', (req, res) => {
    AppController.getStatus(req, res);
  });

  // Get user and file stats
  router.get('/stats', (req, res) => {
    AppController.getStats(req, res);
  });

  // User Controller

  // Create a new user
  router.post('/users', (req, res) => {
    UsersController.postNew(req, res);
  });

  // Get authenticated user
  router.get('/users/me', (req, res) => {
    UsersController.getMe(req, res);
  });

  // Auth Controller

  // Sign in the user
  router.get('/connect', (req, res) => {
    AuthController.getConnect(req, res);
  });

  // Sign out the user
  router.get('/disconnect', (req, res) => {
    AuthController.getDisconnect(req, res);
  });

  // Files Controller

  // Upload a new file
  router.post('/files', (req, res) => {
    FilesController.postUpload(req, res);
  });

  // Get file by ID
  router.get('/files/:id', (req, res) => {
    FilesController.getShow(req, res);
  });

  // List files by parentId
  router.get('/files', (req, res) => {
    FilesController.getIndex(req, res);
  });

  // Publish a file
  router.put('/files/:id/publish', (req, res) => {
    FilesController.putPublish(req, res);
  });

  // Unpublish a file
  router.put('/files/:id/unpublish', (req, res) => {
    FilesController.putUnpublish(req, res);
  });

  // Get file content by ID
  router.get('/files/:id/data', (req, res) => {
    FilesController.getFile(req, res);
  });
}

export default controllerRouting;
