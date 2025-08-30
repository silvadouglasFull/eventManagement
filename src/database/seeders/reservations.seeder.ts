import { MySql2Database } from 'drizzle-orm/mysql2';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../core/Logger';
import * as reservationSchema from '../../modules/reservations/schemas/reservation';
import { reservations } from '../../modules/reservations/schemas/reservation';
import * as roomSchema from '../../modules/rooms/schemas/room';
import { rooms } from '../../modules/rooms/schemas/room';
import * as userSchema from '../../modules/users/schemas/user';
import { users } from '../../modules/users/schemas/user';

export async function reservationSeeder(db: MySql2Database<typeof reservationSchema & typeof roomSchema & typeof userSchema>): Promise<void> {
    Logger.info('Seeder', 'Running reservation seeder...');

    const existingReservations = await db.select().from(reservations).limit(1);
    if (existingReservations.length > 0) {
        Logger.info('Seeder', 'Reservations already exist. Skipping creation.');
        return;
    }

    const allUsers = await db.select().from(users);
    const allRooms = await db.select().from(rooms);

    if (allUsers.length === 0 || allRooms.length === 0) {
        Logger.warn('Seeder', 'Cannot run reservation seeder. Users or Rooms do not exist. Please run user and room seeders first.');
        return;
    }

    const userAlice = allUsers.find(u => u.email === 'alice@example.com');
    const roomAlpha = allRooms.find(r => r.name === 'Alpha Meeting Room');
    const roomBeta = allRooms.find(r => r.name === 'Beta Meeting Room');

    if (!userAlice || !roomAlpha || !roomBeta) {
        Logger.warn('Seeder', 'Required user or room not found. Skipping reservation seeder.');
        return;
    }

    const reservationDate = new Date();
    const reservationsToInsert = [
        {
            id: uuidv4(),
            room_id: roomAlpha.id,
            user_id: userAlice.id,
            start_time: new Date(reservationDate.getFullYear(), reservationDate.getMonth(), reservationDate.getDate(), 9, 0),
            end_time: new Date(reservationDate.getFullYear(), reservationDate.getMonth(), reservationDate.getDate(), 10, 0),
            is_cancelled: 0,
        },
        {
            id: uuidv4(),
            room_id: roomBeta.id,
            user_id: userAlice.id,
            start_time: new Date(reservationDate.getFullYear(), reservationDate.getMonth(), reservationDate.getDate(), 11, 0),
            end_time: new Date(reservationDate.getFullYear(), reservationDate.getMonth(), reservationDate.getDate(), 12, 0),
            is_cancelled: 0,
        },
    ];

    for (const reservation of reservationsToInsert) {
        await db.insert(reservations).values(reservation);
    }

    Logger.info('Seeder', 'Reservation seeder finished.');
}