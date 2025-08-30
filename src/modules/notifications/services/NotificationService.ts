import { Logger } from '../../../core/Logger';
import { NotificationRepository } from '../repositories/NotificationRepository';

export class NotificationService {
    constructor(private notificationRepository: NotificationRepository) { }

    public async enqueueGuestConfirmations(guests: string[], reservationId: string): Promise<boolean> {
        Logger.info('NotificationService', `Enqueuing attendance confirmation notifications for guests of reservation ${reservationId}.`);

        const creationPromises = guests.map(guest => {
            const message = `You've been invited to a meeting. Please confirm your attendance to reserve the room. ${reservationId}.`;
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
}