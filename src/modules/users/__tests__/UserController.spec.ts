import { Request, Response } from 'express';
import { IBaseService } from '../../rooms/services/IBaseService';
import { UserController } from '../controllers/UserController';
import { User } from '../schemas/user';

describe('UserController', () => {
    let userController: UserController;
    let mockUserService: jest.Mocked<IBaseService<User>>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        // Mock do serviço para isolar o controlador no teste
        mockUserService = {
            create: jest.fn(),
            findAll: jest.fn(),
        };

        // Instanciar o controlador com o serviço mockado
        userController = new UserController(mockUserService as IBaseService<User>);

        // Mock das requisições e respostas do Express
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    // Teste para o método 'create' com dados válidos
    it('should create a user and return a 201 status with the new user data', async () => {
        // Configurar o mock para a requisição
        const userPayload = { name: 'João da Silva', email: 'joao.silva@example.com' };
        const createdUser = { id: 'uuid-123', ...userPayload, created_at: new Date() };

        mockRequest.body = userPayload;
        mockUserService.create.mockResolvedValue(createdUser);

        // Chamar o método do controlador
        await userController.create(mockRequest as Request, mockResponse as Response);

        // Validar as ações do controlador
        expect(mockUserService.create).toHaveBeenCalledWith(userPayload);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'User created successfully!',
            data: createdUser,
            success: true,
        });
    });

    // Teste para o método 'create' com dados inválidos
    it('should return a 400 status for invalid payload on create', async () => {
        mockRequest.body = { name: 'Jo' }; // Payload inválido (nome muito curto)

        await userController.create(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Validation failed.',
            errors: expect.any(String),
            success: false,
        });
    });

    // Teste para o método 'findAll'
    it('should return a list of users and a 200 status', async () => {
        // Configurar o mock para a requisição
        const paginatedUsers = [{ id: 'uuid-1', name: 'User 1', email: 'user1@example.com', created_at: new Date() }];
        mockRequest.query = { page: '1', limit: '10' };
        mockUserService.findAll.mockResolvedValue(paginatedUsers);

        // Chamar o método do controlador
        await userController.findAll(mockRequest as Request, mockResponse as Response);

        // Validar as ações do controlador
        expect(mockUserService.findAll).toHaveBeenCalledWith(1, 10, { id: undefined, name: undefined });
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Users fetched successfully!',
            data: paginatedUsers,
            success: true,
        });
    });
});