import { Router } from 'express';
import { UserController } from 'modules/users/controllers/UserController';
import { AuthController } from '../controllers/AuthController';
export const createAuthRouter = (authController: AuthController, userController: UserController): Router => {
    const authRouter = Router();
    authRouter.post('/login', (req, res) => authController.login(req, res))
    authRouter.post('/user', (req, res) => userController.create(req, res));

    return authRouter;
};