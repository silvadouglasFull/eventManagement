import { IBaseRepository } from '../repositories/IBaseRepository';
import { User } from '../schemas/user';
import { IBaseService } from './IBaseService';

export class UserService implements IBaseService<User> {
    constructor(private repository: IBaseRepository<User>) { }

    public async create(data: Omit<User, 'id' | 'created_at'>): Promise<User | null> {
        return this.repository.create(data);
    }

    public async findAll(page: number, limit: number, filters?: { id?: string; name?: string }): Promise<Omit<User, 'password'>[] | null> {
        return this.repository.findAll(page, limit, filters);
    }
}