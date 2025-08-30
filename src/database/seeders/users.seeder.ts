import bcrypt from 'bcrypt';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { v4 } from 'uuid';
import { Logger } from '../../core/Logger';
import * as schema from '../../modules/users/schemas/user';
import { users } from '../../modules/users/schemas/user';
const NUM_USERS_TO_CREATE = 3;

export async function userSeeder(db: MySql2Database<typeof schema>): Promise<void> {
    Logger.info('Seeder', 'Running user seeder...');

    const existingUsers = await db.select().from(users).limit(NUM_USERS_TO_CREATE);

    if (existingUsers.length > 0) {
        Logger.info('Seeder', 'Users already exist. Skipping creation.');
        return;
    }

    const defaultPassword = 'Password@1234';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const usersToInsert = [
        { id: v4(), name: 'Alice', email: 'alice@example.com', password: hashedPassword },
        { id: v4(), name: 'Bob', email: 'bob@example.com', password: hashedPassword },
        { id: v4(), name: 'Charlie', email: 'charlie@example.com', password: hashedPassword },
    ];

    for (const user of usersToInsert) {
        await db.insert(users).values(user);
        Logger.info('Seeder', `User ${user.email} created.`);
    }

    Logger.info('Seeder', 'User seeder finished.');
}