import cookieParser from 'cookie-parser';
import { EventEmitter } from 'core/EventEmitter';
import cors from 'cors';
import { connectToMongo } from 'database/connectMongo';
import { AuthController } from 'modules/auth/controllers/AuthController';
import { AuthRepository } from 'modules/auth/repositories/AuthRepository';
import { createAuthRouter } from 'modules/auth/routes';
import { AuthService } from 'modules/auth/services/AuthService';
import { ConfirmationRepository } from 'modules/confirmations/repositories/ConfirmationRepository';
import { createConfirmationRoutes } from 'modules/confirmations/routes';
import { GuestRepository } from 'modules/guests/repositories/GuestRepository';
import { createGuestRoutes } from 'modules/guests/router';
import { NotificationRepository } from 'modules/notifications/repositories/NotificationRepository';
import { NotificationJobService } from 'modules/notifications/services/NotificationJobService';
import { NotificationService } from 'modules/notifications/services/NotificationService';
import { ReservationController } from 'modules/reservations/controllers/ReservationController';
import { ReservationRepository } from 'modules/reservations/repositories/ReservationRepository';
import { createReservationRouter } from 'modules/reservations/routes';
import { ReservationService } from 'modules/reservations/services/ReservationService';
import { UserController } from 'modules/users/controllers/UserController';
import { UserRepository } from 'modules/users/repositories/UserRepository';
import { createUserRouter } from 'modules/users/routes';
import { UserService } from 'modules/users/services/UserService';
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
        const mongoConnection = await connectToMongo()
        const eventEmitter = new EventEmitter();
        // Injeção de Dependências - Módulo Roms
        const roomRepository = new RoomRepository(db);
        const roomService = new RoomService(roomRepository);
        const roomController = new RoomController(roomService);

        // Injeção de Dependências - Módulo de Reservations
        const reservationRepository = new ReservationRepository(db);
        const reservationService = new ReservationService(reservationRepository, eventEmitter);
        const reservationController = new ReservationController(reservationService);

        // Injeção de Dependências - Módulo de Users
        const userRepository = new UserRepository(db);
        const userService = new UserService(userRepository);
        const userController = new UserController(userService);

        // Injeção de Dependências - Módulo de Users
        const authRepository = new AuthRepository(db);
        const authService = new AuthService(authRepository);
        const authController = new AuthController(authService);


        //Injeção de Dependência - Módulo de Confirmations
        const confirmationRepository = new ConfirmationRepository(db);
        // Injeção de Dependência - Módulo de Notifications
        const notificationRepository = new NotificationRepository(mongoConnection);
        const notificationService = new NotificationService(notificationRepository, eventEmitter);
        //Injeção de Dependências - Módulo de Guests
        const guestRepository = new GuestRepository(db);
        // Criação das Rotas
        const authRouter = createAuthRouter(authController, userController);
        const userRouter = createUserRouter(userController);
        const roomRouter = createRoomRouter(roomController);
        const reservationRouter = createReservationRouter(reservationController);
        const guestsRouter = createGuestRoutes(guestRepository, userRepository, reservationRepository, eventEmitter, notificationService)
        const confirmationsRouter = createConfirmationRoutes(
            confirmationRepository,
            reservationService,
            reservationService,
            userRepository,
            eventEmitter)
        const notificationJobService = new NotificationJobService(notificationRepository);
        notificationJobService.startJob();
        const app = new App(PORT);

        app.server.use(cors({
            credentials: true,
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        }))
        // Integrar o roteador ao Express
        app.server.use(cookieParser());
        app.server.use('/auth', authRouter)
        app.server.use('/rooms', roomRouter);
        app.server.use('/reservations', reservationRouter);
        app.server.use('/reservations', guestsRouter);
        app.server.use('/users', userRouter);
        app.server.use('/reservations', confirmationsRouter)
        Logger.info('Bootstrap', 'Application started successfully.')
        // Iniciar o servidor
        app.listen();
    } catch (error) {
        Logger.error('Bootstrap', 'Failed to start the application.', error);
        process.exit(1);
    }
}

bootstrap();