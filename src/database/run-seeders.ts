// src/database/run-seeders.ts
import { Logger } from '../core/Logger';
import { connectToDatabase } from '../database';
import { reservationSeeder } from './seeders/reservations.seeder';
import { roomSeeder } from './seeders/rooms.seeder';
import { userSeeder } from './seeders/users.seeder';

async function runSeeders() {
    const db = await connectToDatabase();
    Logger.info('Database', 'Connected to the database. Running seeders...');

    try {
        await userSeeder(db as any);
        await roomSeeder(db as any);
        await reservationSeeder(db as any);
    } catch (error) {
        Logger.error('Database', 'Error running seeders.', error);
        process.exit(1);
    } finally {
        Logger.info('Database', 'All seeders finished. Closing connection...');
        process.exit(0);
    }
}

runSeeders();