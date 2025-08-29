import { Request, Response } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';

describe('AuthController', () => {
    let authController: AuthController;
    let mockAuthService: jest.Mocked<AuthService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        // Mock do serviço de autenticação para isolar o controlador
        mockAuthService = {
            login: jest.fn(),
        } as unknown as jest.Mocked<AuthService>;

        // Instanciar o controlador com o serviço mockado
        authController = new AuthController(mockAuthService);

        // Mock das requisições e respostas do Express
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn().mockReturnThis(),
        };
    });

    // Teste para login bem-sucedido
    it('should return a JWT token and a 200 status for a successful login', async () => {
        // Configurar o mock para a requisição
        const loginPayload = { email: 'test@example.com', password: 'password123' };
        const mockToken = 'mocked-jwt-token';

        mockRequest.body = loginPayload;
        mockAuthService.login.mockResolvedValue(mockToken);

        // Chamar o método do controlador
        await authController.login(mockRequest as Request, mockResponse as Response);

        // Validar as ações do controlador
        expect(mockAuthService.login).toHaveBeenCalledWith(loginPayload.email, loginPayload.password);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Login successful!',
            success: true,
        });
        // Validar se o cookie foi definido corretamente
        expect(mockResponse.cookie).toHaveBeenCalledWith('token', mockToken, expect.anything());
    });

    // Teste para login com credenciais inválidas
    it('should return a 401 status for invalid credentials', async () => {
        // Configurar o mock para a requisição
        const loginPayload = { email: 'test@example.com', password: 'wrong-password' };

        mockRequest.body = loginPayload;
        mockAuthService.login.mockResolvedValue(null);

        // Chamar o método do controlador
        await authController.login(mockRequest as Request, mockResponse as Response);

        // Validar as ações do controlador
        expect(mockAuthService.login).toHaveBeenCalledWith(loginPayload.email, loginPayload.password);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Invalid credentials.',
            success: false,
        });
    });

    // Teste para login com payload inválido (validação de schema)
    it('should return a 400 status for an invalid login payload', async () => {
        mockRequest.body = { email: 'invalid-email' }; // Payload sem senha

        await authController.login(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Validation failed.',
            success: false,
            errors: expect.any(String),
        });
    });
});