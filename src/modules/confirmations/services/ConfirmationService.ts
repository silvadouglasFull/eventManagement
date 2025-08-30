// src/modules/confirmations/services/ConfirmationService.ts
import { Logger } from '../../../core/Logger';
import { ConfirmationRepository } from '../repositories/ConfirmationRepository';
import { ICancellationStrategy } from '../strategies/ICancellationStrategy';

export class ConfirmationService {
    constructor(
        private confirmationRepository: ConfirmationRepository,
        private cancellationStrategy: ICancellationStrategy
    ) { }

    public async updateAttendance(userId: string, reservationId: string, status: 0 | 1 | 2): Promise<boolean> {
        Logger.info('ConfirmationService', `Updating attendance for user ${userId} on reservation ${reservationId} to status ${status}.`);

        const result = await this.confirmationRepository.upsertStatus(userId, reservationId, status);

        if (!result) {
            Logger.error('ConfirmationService', 'Failed to update attendance status.', null);
            return false;
        }

        const guests = await this.confirmationRepository.getGuestStatuses(reservationId);
        const { declinedCount, totalGuests } = guests as { totalGuests: number, declinedCount: number }
        if (totalGuests > 0 && totalGuests === declinedCount) {
            Logger.warn('ConfirmationService', `All guests have declined. Triggering auto-cancellation for reservation ${reservationId}.`);
            await this.cancellationStrategy.execute(reservationId);
        }

        return result;
    }
}