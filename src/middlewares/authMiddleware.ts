// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
    return res.status(401).json({ erro: "Token não fornecido" });
    }
    const [, token] = authHeader.split(' '); // Separa "Bearer" de "TOKEN"

        try {
        const secret = process.env.JWT_SECRET || 'XT_WS_%*924=23=lufa';
            const decoded = jwt.verify(token, secret);
        (req as any).user = decoded; // Coloca os dados do usuário na requisição
    return next();
}   catch (err) {
    return res.status(401).json({ erro: "Token inválido ou expirado" });
} 
};