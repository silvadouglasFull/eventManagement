import { sql } from 'drizzle-orm';
import { datetime, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { z } from 'zod';

// Schema do Drizzle (para o banco de dados)
export const users = mysqlTable('users', {
    id: varchar('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    created_at: datetime('created_at').notNull().default(sql`now()`),
});

// Tipo TypeScript inferido do schema do Drizzle
export type User = typeof users.$inferSelect;

// Schema de validação Zod (para as requisições)
export const createUserSchema = z.object({
    name: z.string({ error: 'Name is required.' }).min(3, { message: 'Name must be at least 3 characters long.' }),
    email: z.string({ error: 'Email is required.' }).email({ message: 'Invalid email address.' }),
});