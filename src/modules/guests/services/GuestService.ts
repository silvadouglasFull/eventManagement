// src/modules/guests/services/GuestService.ts
import { NotificationService } from 'modules/notifications/services/NotificationService';
import { NewReservationCreatedEvent } from 'modules/reservations/events/NewReservationCreatedEvent';
import { Reservation } from 'modules/reservations/schemas/reservation';
import { EventEmitter } from '../../../core/EventEmitter';
import { ValidationException } from '../../../core/exceptions/ValidationException';
import { Logger } from '../../../core/Logger';
import { IBaseRepository as IReservationBaseRepository } from '../../reservations/repositories/IBaseRepository';
import { IBaseRepository } from '../../users/repositories/IBaseRepository';
import { User } from '../../users/schemas/user';
import { GuestRepository } from '../repositories/GuestRepository';
import { Guest } from '../schemas/guest';

export class GuestService {
    constructor(
        private guestRepository: GuestRepository,
        private userRepository: IBaseRepository<User>,
        private reservationRepository: IReservationBaseRepository<Reservation>,
        private eventEmitter: EventEmitter,
        private notificationService: NotificationService
    ) {
        this.subscribeToEvents()
    }

    public async addGuests(reservationId: string, guestIds: string[]): Promise<boolean> {
        // 1. Validar se os usuários existem antes de tentar adicioná-los
        const existingUsersPromises = guestIds.map(async id => await this.userRepository.findOneById(id));
        const existingReservationsPromises = this.reservationRepository.findOneById(reservationId)
        const [existingUsers, existingReservations] = await Promise.all([existingUsersPromises, existingReservationsPromises]);
        if (!existingReservations) {
            throw new ValidationException([{
                code: 'custom',
                message: `The reservation not found`,
                path: ['guests'],
            }]);
        }
        const nonExistentUserIds = guestIds.filter((_, index) => !existingUsers[index]);

        if (nonExistentUserIds.length > 0) {
            throw new ValidationException([{
                code: 'custom',
                message: `The following guests were not found: ${nonExistentUserIds.join(', ')}`,
                path: ['guests'],
            }]);
        }
        const guestsToInsert: Omit<Guest, 'id'>[] = guestIds.map(userId => ({
            reservation_id: reservationId,
            user_id: userId,
        }));

        const result = await this.guestRepository.addGuests(guestsToInsert);
        const guestsUser = await Promise.all(existingUsers)
        if (!result) {
            throw new ValidationException([{
                code: 'custom',
                message: 'Failed to add guests to the reservation.',
                path: ['guests'],
            }]);
        }
        Logger.info('GuestService', 'Guests added successfully. Notification logic pending.');
        if (guestsUser.length) {
            await this.notificationService.enqueueGuestConfirmations(guestsToInsert.map(guest => guest.user_id), reservationId);
        }
        return result;
    }
    async findAll(
        page: number,
        limit: number,
        filters?: { id?: string }): Promise<Guest[] | null> {
        try {
            return await this.guestRepository.findAll(page, limit, filters)
        } catch (error) {
            Logger.error('GuestRepository', 'Error retrieve guests', error)
            return null
        }
    }
    private subscribeToEvents(): void {
        this.eventEmitter.on<NewReservationCreatedEvent>('new.reservation.created', async (event) => {
            const { reservationId, guests } = event;
            Logger.info('GuestService', `Received new.reservation.created event for reservation ${reservationId}`);
            await this.addGuests(reservationId, guests);
            // Chamando o NotificationService para enfileirar as notificações
            Logger.info('GuestService', 'Guests added successfully. Notification logic pending.');
        });
    }

}