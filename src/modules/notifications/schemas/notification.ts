import { ObjectId } from 'mongodb';

export interface Notification {
    _id?: ObjectId;
    user_id: string; // O ID do usuário que receberá a notificação
    message: string;
    type: 'presence_confirmation' | 'reservation_confirmation'; // Para identificar o tipo de notificação
    status: 'pending' | 'sent' | 'failed';
    created_at: Date;
    sent_at?: Date;
}