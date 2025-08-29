import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { z } from 'zod';

// Schema do Drizzle (para o banco de dados)
export const rooms = mysqlTable('rooms', {
    id: varchar('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
});

// Tipo TypeScript inferido do schema do Drizzle
export type Room = typeof rooms.$inferSelect;

// Schema de validação Zod (para as requisições)
export const createRoomSchema = z.object({
    name: z.string({ error: 'Room name is required.' }).min(3, { message: 'Room name must be at least 3 characters.' }),
});