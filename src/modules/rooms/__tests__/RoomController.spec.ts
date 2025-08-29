import { Request, Response } from 'express';
import { IBaseService } from '../../../services/IBaseService';
import { RoomController } from '../controllers/RoomController';
import { Room } from '../schemas/room';

describe('RoomController', () => {
    let roomController: RoomController;
    let mockRoomService: jest.Mocked<IBaseService<Room>>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        // Mock do serviço para isolar o controlador no teste
        mockRoomService = {
            create: jest.fn(),
            findAll: jest.fn(),
        };

        // Instanciar o controlador com o serviço mockado
        roomController = new RoomController(mockRoomService as IBaseService<Room>);

        // Mock das requisições e respostas do Express
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    // Teste para o método 'create' com dados válidos
    it('should create a room and return a 201 status with the new room data', async () => {
        // Configurar o mock para a requisição
        const roomPayload = { name: 'New Room' };
        const createdRoom = { id: 'uuid-123', name: 'New Room' };

        mockRequest.body = roomPayload;
        mockRoomService.create.mockResolvedValue(createdRoom);

        // Chamar o método do controlador
        await roomController.create(mockRequest as Request, mockResponse as Response);

        // Validar as ações do controlador
        expect(mockRoomService.create).toHaveBeenCalledWith(roomPayload);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Room created successfully!',
            data: createdRoom,
            success: true,
        });
    });

    // Teste para o método 'create' com dados inválidos (sem 'name')
    it('should return a 400 status for invalid payload on create', async () => {
        mockRequest.body = {}; // Payload inválido

        await roomController.create(mockRequest as Request, mockResponse as Response);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Validation failed.',
            errors: expect.any(String),
            success: false,
        });
    });

    // Teste para o método 'findAll'
    it('should return a list of rooms and a 200 status', async () => {
        // Configurar o mock para a requisição
        const paginatedRooms = [{ id: 'uuid-1', name: 'Room 1' }];
        mockRequest.query = { page: '1', limit: '10' };
        mockRoomService.findAll.mockResolvedValue(paginatedRooms);

        // Chamar o método do controlador
        await roomController.findAll(mockRequest as Request, mockResponse as Response);

        // Validar as ações do controlador
        expect(mockRoomService.findAll).toHaveBeenCalledWith(1, 10, { id: undefined, name: undefined });
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Rooms fetched successfully!',
            data: paginatedRooms,
            success: true,
        });
    });
});