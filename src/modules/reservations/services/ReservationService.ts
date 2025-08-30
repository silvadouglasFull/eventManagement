// ... (imports existentes)
import { EventEmitter } from '../../../core/EventEmitter';
import { Logger } from '../../../core/Logger';
import { ValidationException } from '../../../core/exceptions/ValidationException';
import { IBaseRepository } from '../../../database/repository/IBaseRepository';
import { IBaseService } from '../../../services/IBaseService';
import { NewReservationCreatedEvent } from '../events/NewReservationCreatedEvent';
import { Reservation } from '../schemas/reservation';

export class ReservationService implements IBaseService<Reservation> {
    constructor(
        private repository: IBaseRepository<Reservation>,
        private eventEmitter: EventEmitter
    ) { }

    public async create(
        data: Omit<Reservation, 'id'> & { guests?: string[] }
    ): Promise<Reservation | null> {
        const { room_id, start_time, end_time } = data;

        // Validar conflito de horários
        const conflictingReservations = await (this.repository as any).findConflictingReservations(room_id, start_time, end_time);

        if (conflictingReservations && conflictingReservations.length > 0) {
            Logger.error('ReservationService', 'Conflicting reservation found.', { conflictingReservations });
            throw new ValidationException([{
                code: 'custom',
                message: 'There is a conflicting reservation for this room and time slot.',
                path: ['start_time', 'end_time']
            }]);
        }

        const newReservation = await this.repository.create(data);
        if (newReservation) {
            if (data?.guests && data?.guests.length > 0) {
                const eventData: NewReservationCreatedEvent = {
                    reservationId: newReservation.id,
                    guests: data?.guests,
                };
                this.eventEmitter.emit('new.reservation.created', eventData);
            }
        }
        return newReservation
    }

    public async findAll(page: number, limit: number, filters?: { id?: string; room_id?: string }): Promise<Reservation[] | null> {
        return await this.repository.findAll(page, limit, filters);
    }

    public async cancel(id: string, userId: string): Promise<boolean> {
        return (this.repository as any).cancel(id, userId);
    }
}