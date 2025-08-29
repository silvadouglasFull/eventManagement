import { Request } from 'express';
import { createRoomSchema } from 'modules/rooms/schemas/room';
import { z } from 'zod';

// Define o tipo para o corpo da requisição de criação de sala
export interface CreateRoomRequest extends Request {
    body: z.infer<typeof createRoomSchema>;
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