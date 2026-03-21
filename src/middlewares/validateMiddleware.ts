import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            
            if (error instanceof ZodError) {
                res.status(400).json({ erros: error.flatten().fieldErrors });
                return;
            }

            res.status(500).json({ erro: "Erro interno no servidor durante a validação." });
        }
    };
};