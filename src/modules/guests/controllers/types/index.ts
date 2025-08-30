import { Request } from "express";

export interface Filters {
    id?: string;
    name?: string;
}
export interface RequestPaginateFilterd extends Request {
    query: { [key: string]: any } & {
        page?: string;
        limit?: string;
    } & Filters;
}