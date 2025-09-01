// src/modules/notifications/services/NotificationJobService.ts
import cron from 'node-cron';
import { Logger } from '../../../core/Logger';
import { NotificationRepository } from '../repositories/NotificationRepository';

export class NotificationJobService {
    constructor(private notificationRepository: NotificationRepository) { }

    private async processPendingNotifications(): Promise<void> {
        try {
            Logger.info('NotificationJobService', 'Starting to process pending notifications...');

            // Busca todas as notificações com status 'pending'
            const pendingNotifications = await this.notificationRepository.findManyByFilter({ status: 'pending' });

            if (pendingNotifications?.length === 0 || !pendingNotifications) {
                Logger.info('NotificationJobService', 'No pending notifications found.');
                return;
            }

            // Mapeia as notificações para promessas de envio
            const sendPromises = pendingNotifications.map(async (notification) => {
                try {
                    // Simula o envio via API do WhatsApp
                    Logger.info('NotificationJobService', `Sending notification for user ${notification.user_id}`);
                    // AQUI VOCÊ CHAMARIA SUA API DE WHATSAPP
                    // await whatsappApi.sendMessage(notification.user_id, notification.message);

                    // Atualiza o status para 'sent' se o envio foi bem-sucedido
                    if (notification?._id) await this.notificationRepository.updateStatus(notification._id, 'sent');
                    Logger.info('NotificationJobService', `Notification for ${notification.user_id} sent and status updated.`);
                } catch (error) {
                    Logger.error('NotificationJobService', `Failed to send notification for user ${notification.user_id}.`, error);
                    // Atualiza o status para 'failed' se o envio falhou
                    if (notification?._id) await this.notificationRepository.updateStatus(notification._id, 'failed');
                }
            });

            await Promise.all(sendPromises);
            Logger.info('NotificationJobService', 'Finished processing pending notifications.');
        } catch (error) {
            Logger.error('NotificationJobService', 'An error occurred during the job execution.', error);
        }
    }

    public startJob(): void {
        // Agenda o job para rodar a cada minuto
        // A sintaxe é 'minutos horas dia-do-mes mes dia-da-semana'
        // '*/1 * * * *' significa a cada 1 minuto
        cron.schedule('*/1 * * * *', () => {
            this.processPendingNotifications();
        });
        Logger.info('NotificationJobService', 'Notification job scheduled to run every minute.');
    }
}