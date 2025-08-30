// src/modules/confirmations/services/ConfirmationService.spec.ts

import { ConfirmationService } from '../../services/ConfirmationService';

// Mock das dependências
const mockConfirmationRepository = {
    upsertStatus: jest.fn(),
    getGuestStatuses: jest.fn(),
};

const mockAutoCancelStrategy = {
    execute: jest.fn(),
};

describe('ConfirmationService', () => {
    let service: ConfirmationService;

    beforeEach(() => {
        // Resetar os mocks antes de cada teste
        jest.clearAllMocks();
        service = new ConfirmationService(
            mockConfirmationRepository as any,
            mockAutoCancelStrategy as any
        );
    });

    it('should update the attendance status successfully', async () => {
        mockConfirmationRepository.upsertStatus.mockResolvedValue(true);
        // Retorna o objeto esperado com 0 recusas
        mockConfirmationRepository.getGuestStatuses.mockResolvedValue({ totalGuests: 1, declinedCount: 0 });

        const result = await service.updateAttendance('user-1', 'res-1', 1);

        expect(result).toBe(true);
        expect(mockConfirmationRepository.upsertStatus).toHaveBeenCalledWith('user-1', 'res-1', 1);
        expect(mockConfirmationRepository.getGuestStatuses).toHaveBeenCalledWith('res-1');
        expect(mockAutoCancelStrategy.execute).not.toHaveBeenCalled();
    });

    it('should not call the cancellation strategy if not all guests have declined', async () => {
        mockConfirmationRepository.upsertStatus.mockResolvedValue(true);
        // CORRIGIDO: Simula que 1 de 2 convidados recusou
        mockConfirmationRepository.getGuestStatuses.mockResolvedValue({ totalGuests: 2, declinedCount: 1 });

        const result = await service.updateAttendance('user-2', 'res-2', 2);

        expect(result).toBe(true);
        expect(mockAutoCancelStrategy.execute).not.toHaveBeenCalled();
    });

    it('should call the cancellation strategy if all guests have declined', async () => {
        mockConfirmationRepository.upsertStatus.mockResolvedValue(true);
        // Retorna um objeto onde o total é igual ao número de recusas
        mockConfirmationRepository.getGuestStatuses.mockResolvedValue({ totalGuests: 1, declinedCount: 1 });

        const result = await service.updateAttendance('user-3', 'res-3', 2);
        console.log('result', result)
        expect(result).toBe(true);
        expect(mockAutoCancelStrategy.execute).toHaveBeenCalledWith('res-3')
    });

    it('should return false if updating the status fails', async () => {
        mockConfirmationRepository.upsertStatus.mockResolvedValue(false);
        // Não é necessário mockar getGuestStatuses neste caso, pois a lógica de falha é testada antes.

        const result = await service.updateAttendance('user-4', 'res-4', 1);

        expect(result).toBe(false);
        expect(mockConfirmationRepository.upsertStatus).toHaveBeenCalledWith('user-4', 'res-4', 1);
        expect(mockAutoCancelStrategy.execute).not.toHaveBeenCalled();
    });
});