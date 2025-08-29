import express, { Application } from 'express';
import { Logger } from './core/Logger';

export class App {
    public server: Application;
    private port: number;

    constructor(port: number) {
        this.server = express();
        this.port = port;
        this.middlewares();
    }

    private middlewares() {
        this.server.use(express.json());
    }

    public listen() {
        this.server.listen(this.port, () => {
            Logger.info('Server', `Server is running on port ${this.port}`);
        });
    }
}