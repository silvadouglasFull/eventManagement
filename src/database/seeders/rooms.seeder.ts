import { MySql2Database } from 'drizzle-orm/mysql2';
import { v4 } from 'uuid';
import { Logger } from '../../core/Logger';
import * as schema from '../../modules/rooms/schemas/room';
import { rooms } from '../../modules/rooms/schemas/room';
const NUM_ROOMS_TO_CREATE = 3;

export async function roomSeeder(db: MySql2Database<typeof schema>): Promise<void> {
    Logger.info('Seeder', 'Running room seeder...');

    const existingRooms = await db.select().from(rooms).limit(NUM_ROOMS_TO_CREATE);

    if (existingRooms.length > 0) {
        Logger.info('Seeder', 'Rooms already exist. Skipping creation.');
        return;
    }

    const roomsToInsert = [
        { id: v4(), name: 'Alpha Meeting Room' },
        { id: v4(), name: 'Beta Meeting Room' },
        { id: v4(), name: 'Gamma Meeting Room' },
    ];

    for (const room of roomsToInsert) {
        await db.insert(rooms).values(room);
        Logger.info('Seeder', `Room '${room.name}' created.`);
    }

    Logger.info('Seeder', 'Room seeder finished.');
}