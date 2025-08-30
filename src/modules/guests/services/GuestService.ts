// src/modules/guests/services/GuestService.ts
import { ValidationException } from '../../../core/exceptions/ValidationException';
import { Logger } from '../../../core/Logger';
import { IBaseRepository } from '../../users/repositories/IBaseRepository';
import { User } from '../../users/schemas/user';
import { GuestRepository } from '../repositories/GuestRepository';
import { Guest } from '../schemas/guest';

export class GuestService {
    constructor(
        private guestRepository: GuestRepository,
        private userRepository: IBaseRepository<User>
    ) { }

    public async addGuests(reservationId: string, guestIds: string[]): Promise<boolean> {
        // 1. Validar se os usuários existem antes de tentar adicioná-los
        const existingUsersPromises = guestIds.map(id => this.userRepository.findOneById(id));
        const existingUsers = await Promise.all(existingUsersPromises);

        const nonExistentUserIds = guestIds.filter((id, index) => !existingUsers[index]);

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

        if (!result) {
            throw new ValidationException([{
                code: 'custom',
                message: 'Failed to add guests to the reservation.',
                path: ['guests'],
            }]);
        }

        // Futuramente, adicionaremos a lógica de notificação aqui
        Logger.info('GuestService', 'Guests added successfully. Notification logic pending.');

        return result;
    }
}