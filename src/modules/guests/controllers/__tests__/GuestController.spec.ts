// src/modules/guests/controllers/GuestController.spec.ts
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../../../../core/auth/AuthMiddleware';
import { ValidationException } from '../../../../core/exceptions/ValidationException';
import { GuestController } from '../GuestController';

// Mocks das dependências
const mockGuestService = {
    addGuests: jest.fn(),
};

describe('GuestController', () => {
    let controller: GuestController;
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new GuestController(mockGuestService as any);
        mockRequest = {
            user: { id: uuidv4(), email: 'teste@gmail.com' },
            params: { id: uuidv4() },
            body: { guests: [uuidv4(), uuidv4()] },
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('should add guests and return a 201 status', async () => {
        mockGuestService.addGuests.mockResolvedValue(true);

        await controller.addGuests(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockGuestService.addGuests).toHaveBeenCalledWith(mockRequest.params!.id, mockRequest.body.guests);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Guests added successfully!',
            success: true,
        });
    });

    it('should return a 400 status for invalid request body', async () => {
        mockRequest.body = { guests: ['invalid-uuid'] };

        await controller.addGuests(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockGuestService.addGuests).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Validation failed.',
            success: false,
        }));
    });

    it('should return a 400 status if the service throws a ValidationException', async () => {
        mockGuestService.addGuests.mockRejectedValue(new ValidationException([
            { code: 'custom', message: 'User not found', path: ['guests'] }
        ]));

        await controller.addGuests(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Validation failed.',
            success: false,
            errors: expect.arrayContaining([
                expect.objectContaining({ message: 'User not found' })
            ]),
        }));
    });

    it('should return a 500 status if a general error occurs', async () => {
        mockGuestService.addGuests.mockRejectedValue(new Error('Internal server error'));

        await controller.addGuests(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Internal server error.',
            success: false,
        }));
    });
});