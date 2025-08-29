import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { env } from 'process';

export default defineConfig({
    schema: './src/modules/**/schemas/*.ts',
    out: './drizzle',
    dialect: 'mysql',
    dbCredentials: {
        host: env.DB_HOST as string,
        user: env.MYSQL_USER as string,
        password: env.MYSQL_PASSWORD as string,
        database: env.MYSQL_DATABASE as string,
    },
});