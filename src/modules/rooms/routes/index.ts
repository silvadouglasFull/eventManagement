import { Router } from 'express';
import { RoomController } from '../controllers/RoomController';

// Função para retornar o roteador com o controlador injetado
export const createRoomRouter = (roomController: RoomController): Router => {
    const roomRouter = Router();

    roomRouter.get('/', (req, res) => roomController.findAll(req, res));
    roomRouter.post('/', (req, res) => roomController.create(req, res));

    return roomRouter;
};