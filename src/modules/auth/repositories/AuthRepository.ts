import { Logger } from 'core/Logger';
import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { users } from '../../users/schemas/user';
import { IBaseRepository } from './IBaseRepository';

export class AuthRepository implements IBaseRepository {
    constructor(private db: MySql2Database) { }
    async findOneByEmail(email: string) {
        try {
            const result = await this.db.select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            return result[0] || null;
        } catch (error) {
            Logger.error('AuthRepository', 'Error finding a user by email.', error);
            return null;
        }
    }
}