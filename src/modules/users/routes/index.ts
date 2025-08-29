import { Router } from 'express';
import { UserController } from '../controllers/UserController';

export const createUserRouter = (userController: UserController): Router => {
    const userRouter = Router();

    userRouter.get('/', (req, res) => userController.findAll(req, res));
    userRouter.post('/', (req, res) => userController.create(req, res));

    return userRouter;
};