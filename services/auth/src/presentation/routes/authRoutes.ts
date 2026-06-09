import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  router.post('/login', (req, res) => authController.login(req, res));
  router.post('/signup', (req, res) => authController.signup(req, res));

  return router;
}
