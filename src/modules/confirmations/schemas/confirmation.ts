import { mysqlTable, serial, tinyint, varchar } from 'drizzle-orm/mysql-core';
import z from 'zod';
import { reservations } from '../../reservations/schemas/reservation';
import { users } from '../../users/schemas/user';

export const confirmations = mysqlTable(
    'confirmations',
    {
        id: serial('id').primaryKey(),
        user_id: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        reservation_id: varchar('reservation_id', { length: 36 })
            .notNull()
            .references(() => reservations.id, { onDelete: 'cascade' }),
        status: tinyint('status').notNull().default(0), // 0: Pending, 1: Accepted, 2: Declined
    },
);
export type Confirmations = typeof confirmations.$inferSelect
export const confirmationsSchema = z.object({

})