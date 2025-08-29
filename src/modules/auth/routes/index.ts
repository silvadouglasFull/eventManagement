import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

export const createAuthRouter = (authController: AuthController): Router => {
    const authRouter = Router();
    authRouter.post('/login', (req, res) => authController.login(req, res))
    return authRouter;
};