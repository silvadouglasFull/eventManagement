import { Response } from 'express';
import { ZodError } from 'zod';
import { ValidationException } from '../../../core/exceptions/ValidationException';
import { Logger } from '../../../core/Logger';
import { createRoomSchema, Room } from '../schemas/room';
import { IBaseService } from '../services/IBaseService';
import { CreateRoomRequest, RequestPaginateFilterd } from './types';

export class RoomController {
    constructor(private service: IBaseService<Room>) { }

    public async create(req: CreateRoomRequest, res: Response): Promise<Response> {
        try {
            const data = createRoomSchema.parse(req.body);
            const newRoom = await this.service.create(data);

            if (!newRoom) {
                return res.status(500).json({
                    message: 'Failed to create room.',
                    data: null,
                    success: false,
                });
            }

            return res.status(201).json({
                message: 'Room created successfully!',
                data: newRoom,
                success: true,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                Logger.error('RoomController', 'Validation failed for new room.', error);
                return res.status(400).json({
                    message: 'Validation failed.',
                    errors: error.message,
                    success: false,
                });
            }
            if (error instanceof ValidationException) {
                Logger.error('ReservationController', 'Conflicting reservation for new reservation.', error);
                return res.status(400).json({
                    message: 'Validation failed.',
                    errors: error.errors,
                    success: false,
                });
            }
            Logger.error('RoomController', 'Internal error creating a new room.', error);
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
                name: req.query.name,
            };
            const allRooms = await this.service.findAll(page, limit, filters);

            if (!allRooms) {
                return res.status(404).json({
                    message: 'No rooms found to fetch rooms.',
                    data: null,
                    success: false,
                });
            }

            return res.status(200).json({
                message: 'Rooms fetched successfully!',
                data: allRooms,
                success: true,
            });
        } catch (error) {
            Logger.error('RoomController', 'Error fetching paginated and filtered rooms.', error);
            return res.status(500).json({
                message: 'Internal server error.',
                data: null,
                success: false,
            });
        }
    }
}