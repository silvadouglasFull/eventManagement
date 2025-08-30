// src/modules/guests/controllers/GuestController.ts
import { Response } from 'express';
import { ZodError } from 'zod';
import { Logger } from '../../../core/Logger';
import { AuthenticatedRequest } from '../../../core/auth/AuthMiddleware';
import { ValidationException } from '../../../core/exceptions/ValidationException';
import { addGuestsSchema } from '../schemas/guest';
import { GuestService } from '../services/GuestService';
import { RequestPaginateFilterd } from './types';



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
    public async findAll(req: RequestPaginateFilterd, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const filters = {
                id: req.query.id,
                name: req.query.name,
            };
            const allGuests = await this.service.findAll(page, limit, filters)
            if (!allGuests) {
                return res.status(500).json({
                    message: 'Failed to fetch guests.',
                    data: null,
                    success: false,
                });
            }
            return res.status(200).json({
                message: 'Guests fetched successfully!',
                data: allGuests,
                success: true,
            });
        } catch (error) {
            Logger.error('GuestController', 'Error fetching paginated and filtered guests.', error);
            return res.status(500).json({
                message: 'Internal server error.',
                data: null,
                success: false,
            });
        }
    }
}