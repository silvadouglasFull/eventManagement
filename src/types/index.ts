import { Request } from 'express';

// Define o tipo para os parâmetros de query string de paginação
export interface PaginatedRequest extends Request {
    query: {
        page?: string;
        limit?: string;
    };
}