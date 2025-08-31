import { count, eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { Logger } from '../../../core/Logger';
import * as schema from '../schemas/confirmation';
import { confirmations } from '../schemas/confirmation';
import { ConfirmationStatus } from './types';


export class ConfirmationRepository {
    constructor(private db: MySql2Database<typeof schema>) { }

    public async upsertStatus(userId: string, reservationId: string, status: ConfirmationStatus): Promise<boolean> {
        try {
            const [result] = await this.db.insert(confirmations)
                .values({ user_id: userId, reservation_id: reservationId, status })
                .onDuplicateKeyUpdate({ set: { status } });

            return result.affectedRows > 0;
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
                    total: count()
                })
                    .from(confirmations)
                    .where(eq(confirmations.reservation_id, reservationId)).
                    groupBy(confirmations.status);

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