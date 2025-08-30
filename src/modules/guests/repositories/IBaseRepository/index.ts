import { Guest } from "modules/guests/schemas/guest";

export interface IBaseRepository {
    addGuests(guestsData: Omit<Guest, 'id'>[]): Promise<boolean>
    findAll(
        page: number,
        limit: number,
        filters?: { id?: string }
    ): Promise<Guest[] | null>
    findOneById(reservationId: string): Promise<Guest | null>
}