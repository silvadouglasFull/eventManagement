import { EventEmitter } from 'core/EventEmitter';
import { GuestConfirmedAttendanceEvent } from 'modules/confirmations/events/GuestConfirmedAttendanceEvent';
import { Logger } from '../../../core/Logger';
import { NotificationRepository } from '../repositories/NotificationRepository';

export class NotificationService {
    constructor(private notificationRepository: NotificationRepository,
        private eventEmitter: EventEmitter
    ) {
        this.subscribeToEvents();
    }

    public async enqueueGuestConfirmations(guests: string[], reservationId: string): Promise<boolean> {
        Logger.info('NotificationService', `Enqueuing attendance confirmation notifications for guests of reservation ${reservationId}.`);

        const creationPromises = guests.map(guest => {
            const message = `Você foi convidado para uma reunião. Por favor, confirme sua presença para reservar a sala.`;
            return this.notificationRepository.create({
                user_id: guest,
                message,
                type: 'presence_confirmation',
                created_at: new Date(),
                status: 'pending',
            });
        });

        try {
            await Promise.all(creationPromises);
            return true;
        } catch (error) {
            Logger.error('NotificationService', 'Failed to enqueue notifications.', error);
            return false;
        }
    }
    private subscribeToEvents(): void {
        this.eventEmitter.on<GuestConfirmedAttendanceEvent>('guest.change.presence', async (event: GuestConfirmedAttendanceEvent) => {
            const { creatorId, message } = event;
            Logger.info('NotificationService', `Enqueuing notification for reservation creator ${creatorId}.`);
            await this.notificationRepository.create({
                user_id: creatorId,
                message,
                type: 'reservation_confirmation',
                created_at: new Date(),
                status: 'pending',
            });
        });
    }
}