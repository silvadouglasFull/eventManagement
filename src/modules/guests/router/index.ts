// src/modules/guests/guest.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../../../core/auth/AuthMiddleware';
import { IBaseRepository } from '../../users/repositories/IBaseRepository';
import { User } from '../../users/schemas/user';
import { GuestController } from '../controllers/GuestController';
import { GuestRepository } from '../repositories/GuestRepository';
import { GuestService } from '../services/GuestService';
export function createGuestRoutes(
    guestRepository: GuestRepository,
    userRepository: IBaseRepository<User>
): Router {
    const router = Router();
    const guestService = new GuestService(guestRepository, userRepository);
    const guestController = new GuestController(guestService);

    router.post('/:id/guests', authMiddleware, (req, res) => guestController.addGuests(req, res));

    return router;
}