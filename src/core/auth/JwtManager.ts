import jwt from 'jsonwebtoken';
import { Logger } from '../Logger';
import { JwtPayload } from './types';



export class JwtManager {
    private static readonly SECRET_KEY: string = process.env.JWT_SECRET || 'your_secret_key_change_me';
    private static readonly EXPIRES_IN: jwt.SignOptions = { expiresIn: '1h' };

    public static generateToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.SECRET_KEY, this.EXPIRES_IN);
    }

    public static validateToken(token: string): JwtPayload | null {
        try {
            const decoded = jwt.verify(token, this.SECRET_KEY);
            return decoded as JwtPayload;
        } catch (error) {
            Logger.error('JwtManager', 'Invalid or expired token.', error);
            return null;
        }
    }
}