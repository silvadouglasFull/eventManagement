import { Router } from 'express';
import { ReservationController } from '../controllers/ReservationController';

export const createReservationRouter = (reservationController: ReservationController): Router => {
    const reservationRouter = Router();

    reservationRouter.get('/', (req, res) => reservationController.findAll(req, res));
    reservationRouter.post('/', (req, res) => reservationController.create(req, res));
    reservationRouter.delete('/:id', (req, res) => reservationController.cancel(req, res));
    return reservationRouter;
};