// src/scripts/clear-db.ts
import { Logger } from '../core/Logger';
import { connectToDatabase, } from '../database';
import { connectToMongo } from '../database/connectMongo';
import * as schema from '../database/schema';
async function clearDatabase() {
    const db = await connectToDatabase();
    const mongoConnection = await connectToMongo()
    Logger.info('ClearDB', 'Starting to clear all application data...');

    try {
        await connectToDatabase();
        await connectToMongo();

        Logger.info('ClearDB', 'Clearing `confirmations` and `guests` tables...');
        // Limpa as tabelas com dependências de chaves estrangeiras primeiro
        await db.delete(schema.confirmations);
        await db.delete(schema.guests);

        Logger.info('ClearDB', 'Clearing `reservations` table...');
        await db.delete(schema.reservations);

        Logger.info('ClearDB', 'Clearing `users` and `rooms` tables...');
        // Limpa as tabelas principais em paralelo, já que não têm dependência entre si
        await Promise.all([
            db.delete(schema.users),
            db.delete(schema.rooms)
        ]);

        Logger.info('ClearDB', 'Clearing `notifications` collection in MongoDB...');
        await mongoConnection.collection('notifications').deleteMany({});

        Logger.info('ClearDB', 'Database cleanup completed successfully!');
    } catch (error) {
        Logger.error('ClearDB', 'An error occurred during database cleanup.', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Executa o script
clearDatabase();