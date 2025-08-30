// src/modules/confirmations/confirmation.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../../../core/auth/AuthMiddleware';
import { IBaseService } from '../../../services/IBaseService';
import { Reservation } from '../../reservations/schemas/reservation';
import { ConfirmationController } from '../controllers/ConfirmationController';
import { ConfirmationRepository } from '../repositories/ConfirmationRepository';
import { ConfirmationService } from '../services/ConfirmationService';
import { AutoCancelStrategy } from '../strategies/AutoCancelStrategy';

export function createConfirmationRoutes(
    confirmationRepository: ConfirmationRepository,
    reservationRepository: IBaseService<Reservation>
): Router {
    const router = Router();
    const autoCancelStrategy = new AutoCancelStrategy(reservationRepository);
    const confirmationService = new ConfirmationService(confirmationRepository, autoCancelStrategy);
    const confirmationController = new ConfirmationController(confirmationService);

    router.put('/:id/confirm', authMiddleware, (req, res) => confirmationController.updateStatus(req, res));

    return router;
}