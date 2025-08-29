import bcrypt from 'bcryptjs';
import { and, eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../core/Logger';
import { User, users } from '../schemas/user';
import { IBaseRepository } from './IBaseRepository';
export class UserRepository implements IBaseRepository<User> {
    constructor(private db: MySql2Database) { }

    public async create(data: Omit<User, 'id' | 'created_at'>): Promise<User | null> {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);
            const newUser: Omit<User, 'created_at'> = {
                id: uuidv4(),
                ...data,
                password: hashedPassword,
            };
            await this.db.insert(users).values(newUser)
            const [user] = await this.db.select().from(users).where(eq(users.id, newUser.id)).limit(1);
            return user ?? null
        } catch (error) {
            Logger.error('UserRepository', 'Error creating a new user.', error);
            return null;
        }
    }

    public async findAll(
        page: number,
        limit: number,
        filters?: { id?: string; name?: string }
    ): Promise<Omit<User, 'password'>[] | null> {
        try {
            const offset = (page - 1) * limit;
            const whereConditions = [];

            if (filters?.id) {
                whereConditions.push(eq(users.id, filters.id));
            }
            if (filters?.name) {
                whereConditions.push(eq(users.name, filters.name));
            }

            const allUsers = await this.db
                .select()
                .from(users)
                .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
                .limit(limit)
                .offset(offset);

            return allUsers;
        } catch (error) {
            Logger.error('UserRepository', 'Error fetching paginated and filtered users.', error);
            return null;
        }
    }
}