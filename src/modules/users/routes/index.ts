import { authMiddleware } from 'core/auth/AuthMiddleware';
import { Router } from 'express';
import { UserController } from '../controllers/UserController';

export const createUserRouter = (userController: UserController): Router => {
    const userRouter = Router();
    userRouter.get('/', authMiddleware, (req, res) => userController.findAll(req, res));
    return userRouter;
};