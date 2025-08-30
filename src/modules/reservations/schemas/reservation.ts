import { relations } from 'drizzle-orm';
import { datetime, mysqlTable, tinyint, varchar } from 'drizzle-orm/mysql-core';
import { z } from 'zod';
import { rooms } from '../../rooms/schemas/room';
import { users } from '../../users/schemas/user';

export const reservations = mysqlTable('reservations', {
    id: varchar('id', { length: 36 }).primaryKey(),
    room_id: varchar('room_id', { length: 36 }).notNull().references(() => rooms.id),
    user_id: varchar('user_id', { length: 36 }).notNull().references(() => users.id),
    start_time: datetime('start_time').notNull(),
    end_time: datetime('end_time').notNull(),
    created_at: datetime('created_at').notNull().default(new Date()),
    is_cancelled: tinyint('is_cancelled').notNull().default(0),
});

export const reservationsRelations = relations(reservations, ({ one }) => ({
    user: one(users, {
        fields: [reservations.user_id],
        references: [users.id],
    }),
    room: one(rooms, {
        fields: [reservations.room_id],
        references: [rooms.id],
    }),
}));

export type Reservation = typeof reservations.$inferSelect;

export const createReservationSchema = z.object({
    room_id: z.string({ error: 'Room ID is required.' }).uuid({ message: 'Invalid room ID.' }),
    start_time: z.string({ error: 'Start date is required.' }).datetime({ message: 'Invalid start date.' }),
    end_time: z.string({ error: 'End date is required.' }).datetime({ message: 'Invalid end date.' }),
    guests: z.array(z.string().uuid({ message: 'Invalid guest ID.' })).optional(),
});

export const filterReservationSchema = z.object({
    room_id: z.string().uuid().optional(),
});