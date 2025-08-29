import { and, eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../core/Logger';
import { IBaseRepository } from '../../../database/repository/IBaseRepository';
import { Room, rooms } from '../schemas/room';

export class RoomRepository implements IBaseRepository<Room> {
    constructor(private db: MySql2Database) { }

    public async create(data: Omit<Room, 'id'>): Promise<Room | null> {
        try {
            const newRoom: Room = {
                id: uuidv4(),
                ...data
            };
            await this.db.insert(rooms).values(newRoom);
            return newRoom;
        } catch (error) {
            Logger.error('RoomRepository', 'Error creating a new room.', error);
            return null;
        }
    }

    public async findAll(
        page: number,
        limit: number,
        filters?: { id?: string; name?: string }
    ): Promise<Room[] | null> {
        try {
            const offset = (page - 1) * limit;

            const whereConditions = [];

            if (filters?.id) {
                whereConditions.push(eq(rooms.id, filters.id));
            }

            if (filters?.name) {
                whereConditions.push(eq(rooms.name, filters.name));
            }

            const allRooms = await this.db
                .select()
                .from(rooms)
                .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
                .limit(limit)
                .offset(offset);

            return allRooms;
        } catch (error) {
            Logger.error('RoomRepository', 'Error fetching paginated and filtered rooms.', error);
            return null;
        }
    }
}