// src/modules/confirmations/strategies/AutoCancelStrategy.ts
import { Logger } from '../../../core/Logger';
import { IBaseService } from '../../../services/IBaseService';
import { Reservation } from '../../reservations/schemas/reservation';
import { ICancellationStrategy } from './ICancellationStrategy';

export class AutoCancelStrategy implements ICancellationStrategy {
    constructor(private reservationService: IBaseService<Reservation>) { }

    public async execute(reservationId: string): Promise<void> {
        try {
            Logger.info('AutoCancelStrategy', `Executing auto-cancellation for reservation ${reservationId}`);
            // O ReservationService já tem a lógica de verificação de propriedade,
            // que não se aplica aqui, mas o método de cancelamento é o que precisamos.
            // Para esta estratégia, podemos ignorar a validação de usuário.
            await this.reservationService.cancel(reservationId, '');
            Logger.info('AutoCancelStrategy', `Reservation ${reservationId} cancelled successfully.`);
        } catch (error) {
            Logger.error('AutoCancelStrategy', `Failed to auto-cancel reservation ${reservationId}.`, error);
        }
    }
}