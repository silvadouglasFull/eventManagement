import { EventEmitter } from "core/EventEmitter";
import { Logger } from "core/Logger";
import { GuestConfirmedAttendanceEvent } from "./GuestConfirmedAttendanceEvent";
import { GenerateMessageEvent } from "./util/generateMessageEvent";

export class GuestConfirmedAttendanceEmitEvent {
    public static async emit(
        guestConfirmedAttendanceEvent: Omit<GuestConfirmedAttendanceEvent, 'message'>,
        eventEmitter: EventEmitter,
    ): Promise<void> {
        const { reservationId, guestName, creatorId, status } = guestConfirmedAttendanceEvent;
        const message = GenerateMessageEvent.getStatusMessage(status)
        eventEmitter.emit('guest.change.presence', {
            reservationId, guestName, creatorId, message
        });
        Logger.info('ConfirmationService', `Emitted guest.change.presence event for creator ${creatorId}.`);
    }
}
