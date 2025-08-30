// src/modules/guests/services/GuestService.spec.ts
import { ValidationException } from '../../../../core/exceptions/ValidationException';
import { User } from '../../../users/schemas/user';
import { GuestService } from '../GuestService';

// Mock das dependências
const mockGuestRepository = {
    addGuests: jest.fn(),
};

const mockUserRepository = {
    findOneById: jest.fn(),
};

describe('GuestService', () => {
    let service: GuestService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new GuestService(
            mockGuestRepository as any,
            mockUserRepository as any
        );
    });

    it('should add guests successfully if all users exist', async () => {
        // Simula que os usuários são encontrados
        mockUserRepository.findOneById.mockResolvedValue({ id: 'user-1' } as User);
        mockGuestRepository.addGuests.mockResolvedValue(true);

        const reservationId = 'res-123';
        const guestIds = ['user-1', 'user-2'];

        const result = await service.addGuests(reservationId, guestIds);

        expect(result).toBe(true);
        // Deve chamar findOneById para cada guest
        expect(mockUserRepository.findOneById).toHaveBeenCalledTimes(2);
        expect(mockGuestRepository.addGuests).toHaveBeenCalledWith([
            { reservation_id: 'res-123', user_id: 'user-1' },
            { reservation_id: 'res-123', user_id: 'user-2' },
        ]);
    });

    it('should throw a ValidationException if a guest does not exist', async () => {
        // Simula que um usuário não é encontrado
        mockUserRepository.findOneById
            .mockResolvedValueOnce({ id: 'user-1' } as User)
            .mockResolvedValueOnce(null);

        const reservationId = 'res-123';
        const guestIds = ['user-1', 'user-2'];

        // Espera que o método lance uma exceção
        await expect(service.addGuests(reservationId, guestIds)).rejects.toThrow(ValidationException);

        // Garante que o método de adicionar convidados nunca foi chamado
        expect(mockGuestRepository.addGuests).not.toHaveBeenCalled();
    });

    it('should throw a ValidationException if the repository fails to add guests', async () => {
        // Simula que todos os usuários são encontrados
        mockUserRepository.findOneById.mockResolvedValue({ id: 'user-1' } as User);
        // Simula a falha do repositório
        mockGuestRepository.addGuests.mockResolvedValue(false);

        const reservationId = 'res-123';
        const guestIds = ['user-1'];

        await expect(service.addGuests(reservationId, guestIds)).rejects.toThrow(ValidationException);
    });
});