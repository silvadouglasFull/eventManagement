export interface IBaseRepository<T> {
    create(data: Omit<T, 'id' | 'created_at'>): Promise<T | null>;
    findAll(page: number, limit: number, filters?: { id?: string; name?: string }): Promise<T[] | null>;
    delete?(id: string): Promise<boolean>;
    cancel?(id: string, userId: string): Promise<boolean>;
}