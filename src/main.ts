import { ReservationController } from 'modules/reservations/controllers/ReservationController';
import { ReservationRepository } from 'modules/reservations/repositories/ReservationRepository';
import { createReservationRouter } from 'modules/reservations/routes';
import { ReservationService } from 'modules/reservations/services/ReservationService';
import { Logger } from './core/Logger';
import { connectToDatabase } from './database';
import { App } from './index';
import { RoomController } from './modules/rooms/controllers/RoomController';
import { RoomRepository } from './modules/rooms/repositories/RoomRepository';
import { createRoomRouter } from './modules/rooms/routes';
import { RoomService } from './modules/rooms/services/RoomService';

const PORT = 3000;

async function bootstrap() {
    try {
        const db = await connectToDatabase();

        // Injeção de Dependências
        const roomRepository = new RoomRepository(db);
        const roomService = new RoomService(roomRepository);
        const roomController = new RoomController(roomService);
        // Injeção de Dependências - Módulo de Reservations
        const reservationRepository = new ReservationRepository(db);
        const reservationService = new ReservationService(reservationRepository);
        const reservationController = new ReservationController(reservationService);
        const reservationRouter = createReservationRouter(reservationController);
        // Criação das Rotas
        const roomRouter = createRoomRouter(roomController);
        const app = new App(PORT);

        // Integrar o roteador ao Express
        app.server.use('/rooms', roomRouter);
        app.server.use('/reservations', reservationRouter);

        // Iniciar o servidor
        app.listen();
    } catch (error) {
        Logger.error('Bootstrap', 'Failed to start the application.', error);
        process.exit(1);
    }
}

bootstrap();