// src/modules/guests/repositories/GuestRepository.ts
import { MySql2Database } from 'drizzle-orm/mysql2';
import { Logger } from '../../../core/Logger';
import * as schema from '../schemas/guest';
import { Guest, guests } from '../schemas/guest';

export class GuestRepository {
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
}