// src/modules/reservations/events/NewReservationCreatedEvent.ts
export interface NewReservationCreatedEvent {
    reservationId: string;
    guests: string[];
}