import 'dotenv/config';
import { env } from 'process';

export const dbConfig = {
    host: env.DB_HOST || 'localhost',
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
};