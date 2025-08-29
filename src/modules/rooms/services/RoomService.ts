import { Logger } from 'core/Logger';
import { IBaseRepository } from '../../../database/repository/IBaseRepository';
import { Room } from '../schemas/room';
import { IBaseService } from './IBaseService';

export class RoomService implements IBaseService<Room> {
    constructor(private repository: IBaseRepository<Room>) { }

    public async create(data: Omit<Room, 'id'>): Promise<Room | null> {
        try {
            return this.repository.create(data);
        } catch (error) {
            Logger.error('RoomService', 'Error creating a new room.', error);
            return null;
        }
    }

    public async findAll(page: number, limit: number, filters?: { id?: string; name?: string }): Promise<Room[] | null> {
        try {
            return this.repository.findAll(page, limit, filters);
        } catch (error) {
            Logger.error('RoomService', 'Error fetching rooms.', error);
            return null;
        }
    }
}