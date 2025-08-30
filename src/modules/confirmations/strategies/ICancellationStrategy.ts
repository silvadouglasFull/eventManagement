// src/modules/confirmations/strategies/ICancellationStrategy.ts
export interface ICancellationStrategy {
    execute(reservationId: string): Promise<void>;
}