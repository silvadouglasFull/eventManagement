import { Request } from "express";
import { createUserSchema } from "modules/users/schemas/user";
import z from "zod";
// Define o tipo para o corpo da requisição de criação de sala
export interface CreateRoomRequest extends Request {
    body: z.infer<typeof createUserSchema>;
}
export interface Filters {
    id?: string;
    name?: string;
}
export interface RequestPaginateFilterd extends Request {
    query: { [key: string]: any } & {
        page?: string;
        limit?: string;
    } & Filters;
}