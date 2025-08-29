import { Request } from "express";
import { createReservationSchema } from "modules/reservations/schemas/reservation";
import z from "zod";

// Define o tipo para o corpo da requisição de criação de reserva
export interface CreateReservationRequest extends Request {
    body: z.infer<typeof createReservationSchema>;
}
export interface Filters {
    id?: string;
    room_id?: string;
}
export interface RequestPaginateFilterd extends Request {
    query: { [key: string]: any } & {
        page?: string;
        limit?: string;
    } & Filters;
}