// src/modules/notifications/services/NotificationJobService.spec.ts
import { Notification } from '../schemas/notification';
import { NotificationJobService } from './NotificationJobService';

// Mock do repositório para isolar o serviço no teste
const mockNotificationRepository = {
    findManyByFilter: jest.fn(),
    updateOneById: jest.fn(),
};

describe('NotificationJobService', () => {
    let jobService: NotificationJobService;

    beforeEach(() => {
        // Limpa os mocks antes de cada teste
        jest.clearAllMocks();
        // Instancia o serviço com o mock do repositório
        jobService = new NotificationJobService(mockNotificationRepository as any);
    });

    it('should process and update the status of pending notifications', async () => {
        // Simula notificações pendentes no banco de dados
        const pendingNotifications: Partial<Notification>[] = [
            { user_id: 'user-1', status: 'pending' },
            { user_id: 'user-2', status: 'pending' },
        ];
        mockNotificationRepository.findManyByFilter.mockResolvedValue(pendingNotifications as Notification[]);

        // Chama o método privado que processa as notificações
        // Usamos 'as any' para acessar um método privado para fins de teste
        await (jobService as any).processPendingNotifications();

        // Verifica se o método de busca foi chamado com o filtro correto
        expect(mockNotificationRepository.findManyByFilter).toHaveBeenCalledWith({ status: 'pending' });

        // Verifica se o status de cada notificação foi atualizado
        expect(mockNotificationRepository.updateOneById).toHaveBeenCalledTimes(2);
    });

    it('should do nothing if there are no pending notifications', async () => {
        // Simula um banco de dados sem notificações pendentes
        mockNotificationRepository.findManyByFilter.mockResolvedValue([]);

        await (jobService as any).processPendingNotifications();

        // A busca ainda deve ser chamada
        expect(mockNotificationRepository.findManyByFilter).toHaveBeenCalledWith({ status: 'pending' });

        // Nenhuma atualização deve ser realizada
        expect(mockNotificationRepository.updateOneById).not.toHaveBeenCalled();
    });

    it('should update status to "failed" if a notification fails to send', async () => {
        const pendingNotifications: Partial<Notification>[] = [
            { user_id: 'user-1', status: 'pending' },
        ];
        mockNotificationRepository.findManyByFilter.mockResolvedValue(pendingNotifications as Notification[]);

        // Simula a falha na atualização (como se o envio da API do WhatsApp tivesse falhado)
        mockNotificationRepository.updateOneById.mockRejectedValue(new Error('API failed'));

        await (jobService as any).processPendingNotifications();

        // O serviço deve tentar atualizar o status para falha
        expect(mockNotificationRepository.updateOneById).toHaveBeenCalledWith(
            'notif-1',
            expect.objectContaining({ status: 'failed' })
        );
    });
});