// ... (imports existentes)
import { IBaseService } from '@services/IBaseService';
import { Logger } from '../../../core/Logger';
import { ValidationException } from '../../../core/exceptions/ValidationException';
import { IBaseRepository } from '../../../database/repository/IBaseRepository';
import { Reservation } from '../schemas/reservation';

export class ReservationService implements IBaseService<Reservation> {
    constructor(private repository: IBaseRepository<Reservation>) { }

    public async create(data: Omit<Reservation, 'id' | 'deletedAt'>): Promise<Reservation | null> {
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

        return (this.repository as any).create(data);
    }

    public async findAll(page: number, limit: number, filters?: { id?: string; room_id?: string }): Promise<Reservation[] | null> {
        return (this.repository as any).findAll(page, limit, filters);
    }

    public async cancel(id: string): Promise<boolean> {
        const reservation = await (this.repository as any).findOneById(id);
        if (!reservation) {
            return false;
        }
        return (this.repository as any).delete(id);
    }
}