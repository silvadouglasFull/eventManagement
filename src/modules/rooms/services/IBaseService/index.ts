export interface IBaseService<T> {
    create(data: Omit<T, 'id'>): Promise<T | null>;
    findAll(page: number, limit: number, filters?: { id?: string; name?: string }): Promise<T[] | null>;
}