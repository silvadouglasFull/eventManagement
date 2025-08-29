import { authMiddleware } from 'core/auth/AuthMiddleware';
import { Request, Router } from 'express';
import { ReservationController } from '../controllers/ReservationController';

export const createReservationRouter = (reservationController: ReservationController): Router => {
    const reservationRouter = Router();

    reservationRouter.get('/', authMiddleware, (req, res) => reservationController.findAll(req, res));
    reservationRouter.post('/', authMiddleware, (req, res) => reservationController.create(req, res));
    reservationRouter.delete('/:id', authMiddleware, (req: Request<{ id: string }>, res) => reservationController.cancel(req, res));
    return reservationRouter;
};