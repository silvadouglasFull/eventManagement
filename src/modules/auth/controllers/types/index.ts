import { Request } from "express";
import z from "zod";
export interface RequestLogin extends Request {
    body: {
        email: z.ZodEmail,
        password: z.ZodString
    }
}