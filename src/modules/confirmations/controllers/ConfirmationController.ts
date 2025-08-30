// src/modules/confirmations/controllers/ConfirmationController.ts
import { Response } from 'express';
import { z, ZodError } from 'zod';
import { Logger } from '../../../core/Logger';
import { AuthenticatedRequest } from '../../../core/auth/AuthMiddleware';
import { ValidationException } from '../../../core/exceptions/ValidationException';
import { ConfirmationService } from '../services/ConfirmationService';

const updateStatusSchema = z.object({
    status: z.union([z.literal(0), z.literal(1), z.literal(2)]),
});

export class ConfirmationController {
    constructor(private service: ConfirmationService) { }

    public async updateStatus(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { status } = updateStatusSchema.parse(req.body);
            const user_id = req.user?.id;

            if (!user_id) {
                return res.status(401).json({
                    message: 'User not authenticated.',
                    success: false,
                });
            }

            const result = await this.service.updateAttendance(user_id, id, status);

            if (!result) {
                return res.status(500).json({
                    message: 'Failed to update attendance status.',
                    success: false,
                });
            }

            return res.status(200).json({
                message: 'Attendance status updated successfully!',
                success: true,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                Logger.error('ReservationController', 'Validation failed for new reservarion.', error);
                return res.status(400).json({
                    message: 'Validation failed.',
                    errors: error.message,
                    success: false,
                });
            }
            if (error instanceof ValidationException) {
                return res.status(400).json({
                    message: 'Validation failed.',
                    errors: error.errors,
                    success: false,
                });
            }
            Logger.error('ConfirmationController', 'Internal error updating attendance status.', error);
            return res.status(500).json({
                message: 'Internal server error.',
                success: false,
            });
        }
    }
}