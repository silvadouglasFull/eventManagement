import { Router } from 'express';
import { authMiddleware } from '../../../core/auth/AuthMiddleware';
import { RoomController } from '../controllers/RoomController';

// Função para retornar o roteador com o controlador injetado
export const createRoomRouter = (roomController: RoomController): Router => {
    const roomRouter = Router();

    roomRouter.get('/', authMiddleware, (req, res) => roomController.findAll(req, res));
    roomRouter.post('/', authMiddleware, (req, res) => roomController.create(req, res));

    return roomRouter;
};