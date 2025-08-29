import { User } from "../schemas/user";

export interface IBaseRepository {
    findOneByEmail(email: string): Promise<User | null>
}