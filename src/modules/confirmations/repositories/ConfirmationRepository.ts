import { and, eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { Logger } from '../../../core/Logger';
import * as schema from '../schemas/confirmation';
import { confirmations } from '../schemas/confirmation';
import { ConfirmationStatus } from './types';

export class ConfirmationRepository {
    constructor(private db: MySql2Database<typeof schema>) {
    }
    public async create(data: schema.NewConfirmations): Promise<{ id: number } | null> {
        try {
            const [confirmation] = await this.db.insert(confirmations).values({
                ...data,
                status: 0
            }).$returningId();
            return confirmation
        } catch (error) {
            Logger.error('ConfirmationRepository', 'Error creating confirmation.', error);
            return null
        }
    }
    public async upsertStatus(userId: string, reservationId: string, status: ConfirmationStatus): Promise<boolean> {
        try {
            let [confirmation] = await this.db.update(confirmations).set({
                status
            }).where(and(
                eq(confirmations.reservation_id, reservationId),
                eq(confirmations.user_id, userId)))
            if (confirmation.affectedRows) {
                return true
            }
            await this.create({
                reservation_id: reservationId,
                user_id: userId,
                status
            })
            return true
        } catch (error) {
            Logger.error('ConfirmationRepository', 'Error upserting confirmation status.', error);
            return false;
        }
    }

    public async getGuestStatuses(reservationId: string): Promise<{ totalGuests: number, declinedCount: number } | null> {
        try {
            try {
                const result = await this.db.select({
                    status: confirmations.status,
                })
                    .from(confirmations)
                    .where(eq(confirmations.reservation_id, reservationId))

                const totalGuests = result.length;
                const declinedCount = result.filter(s => s.status === 2).length;
                return { totalGuests, declinedCount };
            } catch (error) {
                Logger.error('ConfirmationRepository', 'Error getting guest statuses.', error);
                return { totalGuests: 0, declinedCount: 0 };
            }
        } catch (error) {
            Logger.error('ConfirmationRepository', 'Error getting guest statuses.', error);
            return null;
        }
    }

}