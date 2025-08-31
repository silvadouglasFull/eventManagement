// src/modules/confirmations/events/GuestConfirmedAttendanceEvent.ts
export interface GuestConfirmedAttendanceEvent {
    reservationId: string;
    guestName: string;
    creatorId: string;
    status: number
    message: string
}