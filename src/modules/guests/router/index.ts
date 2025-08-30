// src/modules/guests/guest.routes.ts
import { Router } from 'express';
import { Reservation } from 'modules/reservations/schemas/reservation';
import { authMiddleware } from '../../../core/auth/AuthMiddleware';
import { IBaseRepository as IReservationBaseRepository } from '../../reservations/repositories/IBaseRepository';
import { IBaseRepository } from '../../users/repositories/IBaseRepository';
import { User } from '../../users/schemas/user';
import { GuestController } from '../controllers/GuestController';
import { GuestRepository } from '../repositories/GuestRepository';
import { GuestService } from '../services/GuestService';
export function createGuestRoutes(
    guestRepository: GuestRepository,
    userRepository: IBaseRepository<User>,
    reservationRepository: IReservationBaseRepository<Reservation>
): Router {
    const router = Router();
    const guestService = new GuestService(guestRepository, userRepository, reservationRepository);
    const guestController = new GuestController(guestService);

    router.post('/:id/guests', authMiddleware, (req, res) => guestController.addGuests(req, res));
    router.get('/guests', authMiddleware, (req, res) => guestController.findAll(req, res))
    return router;
}