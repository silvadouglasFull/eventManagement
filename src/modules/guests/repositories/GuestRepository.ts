// src/modules/guests/repositories/GuestRepository.ts
import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { Logger } from '../../../core/Logger';
import * as schema from '../schemas/guest';
import { Guest, guests } from '../schemas/guest';
import { IBaseRepository } from './IBaseRepository';

export class GuestRepository implements IBaseRepository {
    constructor(private db: MySql2Database<typeof schema>) { }

    public async addGuests(guestsData: Omit<Guest, 'id'>[]): Promise<boolean> {
        if (guestsData.length === 0) {
            return true; // Não há convidados para adicionar
        }
        try {
            await this.db.insert(guests).values(guestsData);
            return true;
        } catch (error) {
            Logger.error('GuestRepository', 'Error adding guests to reservation.', error);
            return false;
        }
    }
    async findAll(
        page: number,
        limit: number,
        filters?: { id?: string }
    ): Promise<Guest[] | null> {
        try {
            const offset = (page - 1) * limit;
            return await this.db.select().from(guests)
                .where(filters?.id ? eq(guests.reservation_id, filters?.id) : undefined)
                .limit(limit)
                .offset(offset);
        } catch (error) {
            Logger.error('GuestRepository', 'Error retrieve guests', error)
            return null
        }
    }
    async findOneById(reservationId: string): Promise<Guest | null> {
        try {
            const [guest] = await this.db.select().from(guests).where(eq(guests.reservation_id, reservationId)).limit(1)
            return guest
        } catch (error) {
            Logger.error('GuestRepository - findOneById', 'Error retrieve guests', error)
            return null
        }
    }
}