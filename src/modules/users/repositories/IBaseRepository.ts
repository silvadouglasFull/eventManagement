import { User } from "../schemas/user";

export interface IBaseRepository<T> {
    create(data: Omit<T, 'id' | 'created_at'>): Promise<T | null>;
    findAll(page: number, limit: number, filters?: { id?: string; name?: string }): Promise<Omit<User, 'password'>[] | null>;
}