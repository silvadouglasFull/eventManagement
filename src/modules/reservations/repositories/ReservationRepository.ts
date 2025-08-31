import { ValidationException } from 'core/exceptions/ValidationException';
import { and, between, eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../core/Logger';
import { Reservation, reservations } from '../schemas/reservation';
import { IBaseRepository } from './IBaseRepository';

export class ReservationRepository implements IBaseRepository<Reservation> {
    constructor(private db: MySql2Database) { }

    public async create(data: Omit<Reservation, 'id'>): Promise<Reservation | null> {
        try {

            const newReservation: Reservation = {
                id: uuidv4(),
                ...data,
            };
            await this.db.insert(reservations).values(newReservation);
            return newReservation;
        } catch (error) {
            Logger.error('ReservationRepository', 'Error creating a new reservation.', error);
            return null;
        }
    }

    public async findAll(
        page: number,
        limit: number,
        filters?: { id?: string; room_id?: string }
    ): Promise<Reservation[] | null> {
        try {
            const offset = (page - 1) * limit;
            const whereConditions = [eq(reservations.is_cancelled, 0)];

            if (filters?.id) {
                whereConditions.push(eq(reservations.id, filters.id));
            }
            if (filters?.room_id) {
                whereConditions.push(eq(reservations.room_id, filters.room_id));
            }

            const allReservations = await this.db
                .select()
                .from(reservations)
                .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
                .limit(limit)
                .offset(offset);

            return allReservations;
        } catch (error) {
            Logger.error('ReservationRepository', 'Error fetching paginated and filtered reservations.', error);
            return null;
        }
    }

    public async findConflictingReservations(roomId: string, startTime: string, endTime: string): Promise<Reservation[] | null> {
        try {
            const conflictingReservations = await this.db
                .select()
                .from(reservations)
                .where(
                    and(
                        eq(reservations.room_id, roomId),
                        between(reservations.start_time, new Date(startTime), new Date(endTime)),
                        eq(reservations.is_cancelled, 0),
                    )
                );

            return conflictingReservations;
        } catch (error) {
            Logger.error('ReservationRepository', 'Error finding conflicting reservations.', error);
            return null;
        }
    }

    public async findOneById(id: string): Promise<Reservation | null> {
        try {
            const result = await this.db.select()
                .from(reservations)
                .where(and(eq(reservations.id, id), eq(reservations.is_cancelled, 0)))
                .limit(1);

            return result[0] || null;
        } catch (error) {
            Logger.error('ReservationRepository', 'Error finding a reservation by id.', error);
            return null;
        }
    }

    public async cancel(id: string, userId: string): Promise<boolean> {
        try {
            const [affectedRows] = await this.db.update(reservations)
                .set({ is_cancelled: 1 })
                .where(userId ? and(eq(reservations.id, id), eq(reservations.user_id, userId)) : eq(reservations.id, id));
            if (affectedRows.affectedRows === 0) {
                throw new ValidationException([{
                    code: 'custom',
                    message: userId ? 'Reservation not found or does not belong to the user.' : 'Reservation not found.',
                    path: ['id']
                }]);
            }
            return true;
        } catch (error) {
            Logger.error('ReservationRepository', `Error deleting reservation with id ${id}.`, error);
            return false;
        }
    }
}