import { Request, Response } from 'express';
import { ValidationException } from '../../../core/exceptions/ValidationException';
import { IBaseService } from '../../../services/IBaseService';
import { ReservationController } from '../controllers/ReservationController';
import { Reservation } from '../schemas/reservation';
describe('ReservationController', () => {
    let reservationController: ReservationController;
    let mockReservationService: jest.Mocked<IBaseService<Omit<Reservation, 'id'>>>;
    let mockRequest: Partial<Request>;
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

    // Teste para o método 'create' com dados válidos
    it('should create a reservation and return a 201 status with the new reservation data', async () => {
        // Configurar o mock para a requisição
        const reservationPayload = {
            room_id: 'uuid-456',
            start_time: new Date('2025-08-28T10:00:00Z'),
            end_time: new Date('2025-08-28T11:00:00Z'),
            notes: null,
            deleted_at: null
        };
        mockRequest.body = reservationPayload;
        mockReservationService.create.mockResolvedValue(reservationPayload);

        // Chamar o método do controlador
        await reservationController.create(mockRequest as Request, mockResponse as Response);

        // Validar as ações do controlador
        expect(mockReservationService.create).toHaveBeenCalledWith(reservationPayload);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Reservation created successfully!',
            data: reservationPayload,
            success: true,
        });
    });

    // Teste para o método 'create' com conflito de horários
    it('should return a 400 status for a conflicting reservation', async () => {
        const reservationPayload = { room_id: 'uuid-123', start_time: '2025-08-28T10:00:00Z', end_time: '2025-08-28T11:00:00Z' };

        mockRequest.body = reservationPayload;

        // Simular um erro de validação (conflito)
        mockReservationService.create.mockRejectedValue(new ValidationException([
            {
                code: 'custom',
                message: 'There is a conflicting reservation for this room and time slot.',
                path: ['start_time', 'end_time']
            }
        ]));

        // Chamar o método do controlador
        await reservationController.create(mockRequest as Request, mockResponse as Response);

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
        const paginatedReservations = [{ id: 'uuid-1', room_id: 'uuid-123', start_time: new Date('2025-08-28T10:00:00Z'), end_time: new Date('2025-08-28T11:00:00Z'), notes: null, deleted_at: null }];
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
    // Teste para o método 'cancel' com sucesso
    it('should cancel a reservation and return a 200 status', async () => {
        mockRequest.params = { id: 'uuid-to-delete' };
        mockReservationService.cancel.mockResolvedValue(true);

        await reservationController.cancel(mockRequest as Request<{ id: string }>, mockResponse as Response);

        expect(mockReservationService.cancel).toHaveBeenCalledWith('uuid-to-delete');
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Reservation cancelled successfully!',
            success: true,
        });
    });

    // Teste para o método 'cancel' quando a reserva não é encontrada
    it('should return a 404 status when a reservation to cancel is not found', async () => {
        mockRequest.params = { id: 'uuid-not-found' };
        mockReservationService.cancel.mockResolvedValue(false);

        await reservationController.cancel(mockRequest as Request<{ id: string }>, mockResponse as Response);

        expect(mockReservationService.cancel).toHaveBeenCalledWith('uuid-not-found');
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Reservation not found or already cancelled.',
            success: false,
        });
    });
});