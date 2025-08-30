// src/modules/guests/schemas/guest.ts
import { mysqlTable, primaryKey, varchar } from 'drizzle-orm/mysql-core';
import z from 'zod';
import { reservations } from '../../reservations/schemas/reservation';
import { users } from '../../users/schemas/user';

export const guests = mysqlTable('guests', {
    user_id: varchar('user_id', { length: 36 })
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    reservation_id: varchar('reservation_id', { length: 36 })
        .notNull()
        .references(() => reservations.id, { onDelete: 'cascade' }),
},
    (t) => ({
        pk: primaryKey({ columns: [t.user_id, t.reservation_id] }),
    })
);
export type Guest = typeof guests.$inferSelect
export const addGuestsSchema = z.object({
    guests: z.array(z.string().uuid({ message: 'Each guest ID must be a valid UUID.' })).nonempty({ message: 'Guests list cannot be empty.' }),
});