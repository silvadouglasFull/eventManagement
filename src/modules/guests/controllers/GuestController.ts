// src/modules/guests/controllers/GuestController.ts
import { Response } from 'express';
import { ZodError } from 'zod';
import { Logger } from '../../../core/Logger';
import { AuthenticatedRequest } from '../../../core/auth/AuthMiddleware';
import { ValidationException } from '../../../core/exceptions/ValidationException';
import { addGuestsSchema } from '../schemas/guest';
import { GuestService } from '../services/GuestService';



export class GuestController {
    constructor(private service: GuestService) { }

    public async addGuests(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { guests } = addGuestsSchema.parse(req.body);

            const result = await this.service.addGuests(id, guests);

            if (!result) {
                return res.status(500).json({
                    message: 'Failed to add guests to reservation.',
                    success: false,
                });
            }

            return res.status(201).json({
                message: 'Guests added successfully!',
                success: true,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                Logger.error('GuestController', 'Validation failed for new guests.', error);
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
            Logger.error('GuestController', 'Internal error adding guests.', error);
            return res.status(500).json({
                message: 'Internal server error.',
                success: false,
            });
        }
    }
}