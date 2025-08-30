import { Response } from 'express';
import { ZodError } from 'zod';
import { Logger } from '../../../core/Logger';
import { AuthenticatedRequest } from '../../../core/auth/AuthMiddleware';
import { ValidationException } from '../../../core/exceptions/ValidationException';
import { IBaseService } from '../../../services/IBaseService';
import { Reservation, createReservationSchema } from '../schemas/reservation';
import { CreateReservationRequest, RequestPaginateFilterd } from './types';

export class ReservationController {
    constructor(private service: IBaseService<Reservation>) { }

    public async create(req: CreateReservationRequest, res: Response): Promise<Response> {
        try {
            const user_id = req?.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'User not authenticated.', success: false });
            }
            const reservationData = createReservationSchema.parse(req.body);
            const newReservation = await this.service.create({
                ...reservationData,
                start_time: new Date(reservationData.start_time),
                end_time: new Date(reservationData.end_time),
                user_id,
                is_cancelled: 0,
                created_at: new Date()
            });

            if (!newReservation) {
                return res.status(500).json({
                    message: 'Failed to create reservation.',
                    data: null,
                    success: false,
                });
            }

            return res.status(201).json({
                message: 'Reservation created successfully!',
                data: newReservation,
                success: true,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                Logger.error('ReservationController', 'Validation failed for new reservarion.', error);
                return res.status(400).json({
                    message: 'Validation failed.',
                    errors: JSON.parse(error.message),
                    success: false,
                });
            }
            if (error instanceof ValidationException) {
                Logger.error('ReservationController', 'Conflicting reservation for new reservation.', error);
                return res.status(400).json({
                    message: error.errors[0].message,
                    errors: error.errors.map(err => err.message).join(' '),
                    success: false,
                });
            }
            Logger.error('ReservationController', 'Internal error creating a new reservation.', error);
            return res.status(500).json({
                message: 'Internal server error.',
                data: null,
                success: false,
            });
        }
    }

    public async findAll(req: RequestPaginateFilterd, res: Response): Promise<Response> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const filters = {
                id: req.query.id,
                room_id: req.query.room_id,
            };

            const allReservations = await this.service.findAll(page, limit, filters);

            if (!allReservations) {
                return res.status(500).json({
                    message: 'Failed to fetch reservations.',
                    data: null,
                    success: false,
                });
            }

            return res.status(200).json({
                message: 'Reservations fetched successfully!',
                data: allReservations,
                success: true,
            });
        } catch (error) {
            Logger.error('ReservationController', 'Error fetching paginated and filtered reservations.', error);
            return res.status(500).json({
                message: 'Internal server error.',
                data: null,
                success: false,
            });
        }
    }
    public async cancel(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const user_id = req.user?.id;
            const result = await this.service.cancel(id, user_id as string);

            if (!result) {
                return res.status(404).json({
                    message: 'Reservation not found or already cancelled.',
                    success: false,
                });
            }

            return res.status(200).json({
                message: 'Reservation cancelled successfully!',
                success: true,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                Logger.error('ReservationController', 'Not found reservation to cancel.', error);
                return res.status(404).json({
                    message: error.message,
                    errors: error.message,
                    success: false,
                });
            }
            if (error instanceof ValidationException) {
                Logger.error('ReservationController', 'Not found reservation to cancel.', error);
                return res.status(404).json({
                    message: error.errors[0].message,
                    errors: error.errors.map(err => err.message).join(' '),
                    success: false,
                });
            }
            Logger.error('ReservationController', 'Error cancelling reservation.', error);
            return res.status(500).json({
                message: 'Internal server error.',
                success: false,
            });
        }
    }
}