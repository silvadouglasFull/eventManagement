import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ValidationException } from '../../../core/exceptions/ValidationException';
import { Logger } from '../../../core/Logger';
import { loginSchema } from '../schemas/loginSchema';
import { AuthService } from '../services/AuthService';

export class AuthController {
    constructor(private authService: AuthService) { }

    public async login(req: Request, res: Response): Promise<Response> {
        try {
            const { email, password } = loginSchema.parse(req.body);

            const token = await this.authService.login(email, password);

            if (!token) {
                return res.status(401).json({
                    message: 'Invalid credentials.',
                    success: false,
                });
            }

            // Define o cookie com o token
            res.cookie('token', token, {
                httpOnly: true,  // Impede que o JavaScript do cliente acesse o cookie
                secure: process.env.NODE_ENV === 'production', // Use 'true' em produção (HTTPS)
                sameSite: 'strict', // Protege contra ataques CSRF
                path: '/', // O cookie estará disponível para todas as rotas
            });

            return res.status(200).json({
                message: 'Login successful!',
                success: true,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                Logger.error('ReservationController', 'Validation failed for new reservarion.', error);
                return res.status(400).json({
                    message: 'Validation failed.',
                    errors: error.message,
                    success: false,
                });
            }
            if (error instanceof ValidationException) {
                Logger.error('AuthController', 'Validation failed for login request.', error);
                return res.status(400).json({
                    message: 'Validation failed.',
                    errors: error.errors.map(err => err.message).join(''),
                    success: false,
                });
            }
            Logger.error('AuthController', 'Internal error during login process.', error);
            return res.status(500).json({
                message: 'Internal server error.',
                success: false,
            });
        }
    }
}