// src/modules/confirmations/services/ConfirmationService.ts
import { Reservation, User } from 'database/schema';
import { EventEmitter } from '../../../core/EventEmitter';
import { Logger } from '../../../core/Logger';
import { IBaseService } from '../../../services/IBaseService';
import { IBaseRepository as IUserBaseRepository } from '../../users/repositories/IBaseRepository';
import { GuestConfirmedAttendanceEmitEvent } from '../events/GuestConfirmedAttendanceEmitEvent';
import { GuestConfirmedAttendanceEvent } from '../events/GuestConfirmedAttendanceEvent';
import { ConfirmationRepository } from '../repositories/ConfirmationRepository';
import { ICancellationStrategy } from '../strategies/ICancellationStrategy';
export class ConfirmationService {
    constructor(
        private confirmationRepository: ConfirmationRepository,
        private cancellationStrategy: ICancellationStrategy,
        private reservationService: IBaseService<Reservation>,
        private userRepository: IUserBaseRepository<User>,
        private eventEmitter: EventEmitter
    ) { }
    private async getGuestName(guestId: string): Promise<string> {
        try {
            const user = await this.userRepository.findOneById(guestId);
            if (!user) {
                throw new Error('User not found');
            }
            const { name } = user
            return name
        } catch (error) {
            Logger.error('ConfirmationService', 'Error fetching guest name.', error);
            return ''
        }
    }
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
        const reservation = await (this.reservationService as any).findOneById(reservationId);
        if (reservation) {
            const guestName = await this.getGuestName(userId)
            const eventData: Omit<GuestConfirmedAttendanceEvent, 'message'> = {
                reservationId,
                guestName,
                creatorId: reservation.user_id,
                status
            };
            GuestConfirmedAttendanceEmitEvent.emit(eventData, this.eventEmitter)
        }
        return result;
    }
}