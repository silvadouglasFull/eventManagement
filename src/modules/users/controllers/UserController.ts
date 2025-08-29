import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Logger } from '../../../core/Logger';
import { ValidationException } from '../../../core/exceptions/ValidationException';
import { IBaseService } from '../../rooms/services/IBaseService';
import { User, createUserSchema } from '../schemas/user';
import { RequestPaginateFilterd } from './types';

export class UserController {
    constructor(private service: IBaseService<User>) { }

    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const data = createUserSchema.parse(req.body);
            const newUser = await this.service.create(data);

            if (!newUser) {
                return res.status(500).json({
                    message: 'Failed to create user.',
                    data: null,
                    success: false,
                });
            }

            return res.status(201).json({
                message: 'User created successfully!',
                data: newUser,
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
                Logger.error('UserController', 'Validation failed for new user.', error);
                return res.status(400).json({
                    message: 'Validation failed.',
                    errors: error.errors,
                    success: false,
                });
            }
            Logger.error('UserController', 'Internal error creating a new user.', error);
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

            const allUsers = await this.service.findAll(page, limit, filters);

            if (!allUsers) {
                return res.status(500).json({
                    message: 'Failed to fetch users.',
                    data: null,
                    success: false,
                });
            }

            return res.status(200).json({
                message: 'Users fetched successfully!',
                data: allUsers,
                success: true,
            });
        } catch (error) {
            Logger.error('UserController', 'Error fetching paginated and filtered users.', error);
            return res.status(500).json({
                message: 'Internal server error.',
                data: null,
                success: false,
            });
        }
    }
}