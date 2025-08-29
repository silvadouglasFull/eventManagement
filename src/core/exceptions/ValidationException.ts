import { z } from 'zod';

export class ValidationException extends Error {
    public errors: z.ZodIssue[];

    constructor(errors: z.ZodIssue[]) {
        super('Validation Error');
        this.name = 'ValidationException';
        this.errors = errors;
    }
}