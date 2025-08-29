import { AuthenticatedRequest } from 'core/auth/AuthMiddleware';
import { Request, Response } from 'express';
import { v4 } from 'uuid';
import { ValidationException } from '../../../core/exceptions/ValidationException';
import { IBaseService } from '../../../services/IBaseService';
import { ReservationController } from '../controllers/ReservationController';
import { CreateReservationRequest } from '../controllers/types';
import { Reservation } from '../schemas/reservation';

describe('ReservationController', () => {
    let reservationController: ReservationController;
    let mockReservationService: jest.Mocked<IBaseService<Omit<Reservation, 'id'>>>;
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        // Mock do serviço para isolar o controlador no teste
        mockReservationService = {
            create: jest.fn(),
            findAll: jest.fn(),
            cancel: jest.fn(),
        };

        // Instanciar o controlador com o serviço mockado
        reservationController = new ReservationController(mockReservationService as IBaseService<Reservation>);

        // Mock das requisições e respostas do Express
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    // Teste para o método 'create' com conflito de horários
    it('should return a 400 status for a conflicting reservation', async () => {
        const reservationPayload = { room_id: 'uuid-123', start_time: '2025-08-28T10:00:00Z', end_time: '2025-08-28T11:00:00Z' };

        mockRequest.body = reservationPayload;
        mockRequest.user = { id: 'uuid-333', email: 'test@example.com' };

        // Simular um erro de validação (conflito)
        mockReservationService.create.mockRejectedValue(new ValidationException([
            {
                code: 'custom',
                message: 'There is a conflicting reservation for this room and time slot.',
                path: ['start_time', 'end_time']
            }
        ]));

        // Chamar o método do controlador
        await reservationController.create(mockRequest as CreateReservationRequest, mockResponse as Response);

        // Validar as ações do controlador
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Validation failed.',
            errors: expect.any(String),
            success: false,
        });
    });

    // Teste para o método 'findAll'
    it('should return a list of reservations and a 200 status', async () => {
        // Configurar o mock para a requisição
        const paginatedReservations = [{
            id: 'uuid-1',
            room_id: 'uuid-123',
            start_time: new Date('2025-08-28T10:00:00Z'),
            end_time: new Date('2025-08-28T11:00:00Z'),
            user_id: 'uuid-333',
            created_at: new Date(),
            is_cancelled: 0,
        }];
        mockRequest.query = { page: '1', limit: '10' };
        mockReservationService.findAll.mockResolvedValue(paginatedReservations);

        // Chamar o método do controlador
        await reservationController.findAll(mockRequest as Request, mockResponse as Response);

        // Validar as ações do controlador
        expect(mockReservationService.findAll).toHaveBeenCalledWith(1, 10, { id: undefined, room_id: undefined });
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Reservations fetched successfully!',
            data: paginatedReservations,
            success: true,
        });
    });
    it('should cancel a reservation and return a 200 status', async () => {
        // Mocks da requisição, agora com user e params
        const uuid1 = v4()
        const uuid2 = v4()
        mockRequest.params = { id: uuid1 };
        mockRequest.user = { id: uuid2, email: 'test@example.com' };

        // O serviço irá receber a chamada com os dois IDs
        mockReservationService.cancel.mockResolvedValue(true);

        await reservationController.cancel(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockReservationService.cancel).toHaveBeenCalledWith(uuid1, uuid2);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Reservation cancelled successfully!',
            success: true,
        });
    });

    // Teste para o método 'cancel' quando a reserva não pertence ao usuário
    it('should return a 404 status when a reservation to cancel does not belong to the user', async () => {
        mockRequest.params = { id: v4() };
        mockRequest.user = { id: v4(), email: 'test@example.com' };

        // Simular um erro de validação (a exceção lançada pelo serviço)
        mockReservationService.cancel.mockRejectedValue(new ValidationException([
            {
                code: 'custom',
                message: expect.any(String),
                path: ['id'],
            }
        ]));

        await reservationController.cancel(mockRequest as AuthenticatedRequest, mockResponse as Response);

        // Espera um 404
        expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
});