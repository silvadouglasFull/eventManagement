import { sql } from 'drizzle-orm';
import { datetime, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { z } from 'zod';

// Schema do Drizzle (para o banco de dados)
export const reservations = mysqlTable('reservations', {
    id: varchar('id', { length: 36 }).primaryKey(),
    room_id: varchar('room_id', { length: 36 }).notNull(),
    start_time: datetime('start_time').notNull(),
    end_time: datetime('end_time').notNull(),
    notes: varchar('notes', { length: 255 }),
    deleted_at: datetime('deleted_at').default(sql`null`),
});

// Tipo TypeScript inferido do schema do Drizzle
export type Reservation = typeof reservations.$inferSelect;
// Schema de validação Zod (para as requisições)
export const createReservationSchema = z.object({
    room_id: z.string({ error: 'Room ID is required.' }).uuid({ message: 'Room ID must be a valid UUID.' }),
    start_time: z.string({ error: 'Start time is required.' }),
    end_time: z.string({ error: 'End time is required.' }),
    notes: z.string().optional(),
});