import { NextFunction, Request, Response } from 'express';
import { JwtManager } from './JwtManager';
import { JwtPayload } from './types';

// Estende a interface Request do Express para incluir o campo 'user'
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Authorization token missing.', success: false });
    }

    const decodedPayload = JwtManager.validateToken(token);
    if (!decodedPayload) {
        return res.status(401).json({ message: 'Invalid or expired token.', success: false });
    }

    // Anexa os dados do usuário à requisição
    req.user = decodedPayload;
    next();
};