import bcrypt from 'bcryptjs';
import { Logger } from '../../../core/Logger';
import { JwtManager } from '../../../core/auth/JwtManager';
import { IBaseRepository } from '../repositories/IBaseRepository';

export class AuthService {
    constructor(private authRepository: IBaseRepository) { }

    public async login(email: string, password_candidate: string): Promise<string | null> {
        const user = await this.authRepository.findOneByEmail(email);

        if (!user) {
            Logger.info('AuthService', 'Login attempt with non-existent email.');
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password_candidate, user.password);

        if (!isPasswordValid) {
            Logger.warn('AuthService', 'Login attempt with invalid password.', { email: user.email });
            return null;
        }

        const payload = {
            id: user.id,
            email: user.email,
        };

        return JwtManager.generateToken(payload);
    }
}