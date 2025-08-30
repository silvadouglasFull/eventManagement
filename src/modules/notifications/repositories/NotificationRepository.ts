import { Collection, Db, ObjectId } from 'mongodb';
import { Logger } from '../../../core/Logger';
import { Notification } from '../schemas/notification';

export class NotificationRepository {
    private collection: Collection<Notification>;

    constructor(db: Db) {
        this.collection = db.collection('notifications');
    }

    public async create(notification: Omit<Notification, '_id'>): Promise<Notification | null> {
        try {
            const result = await this.collection.insertOne({
                ...notification,
                status: 'pending',
                created_at: new Date(),
            } as Notification);

            if (result.insertedId) {
                return { ...notification, _id: result.insertedId };
            }

            return null;
        } catch (error) {
            Logger.error('NotificationRepository', 'Error creating new notification.', error);
            return null;
        }
    }

    public async updateStatus(id: ObjectId, status: 'sent' | 'failed'): Promise<boolean> {
        try {
            const updateDoc: any = { status };
            if (status === 'sent') {
                updateDoc.sent_at = new Date();
            }

            const result = await this.collection.updateOne(
                { _id: id },
                { $set: updateDoc }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            Logger.error('NotificationRepository', `Error updating notification status for id ${id}.`, error);
            return false;
        }
    }
}