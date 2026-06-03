import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const getJwtSecret = (res: Response) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({ erro: 'Configuracao interna invalida.' });
        return null;
    }
    return secret;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: 'Token nao fornecido' });
    }

    const [, token] = authHeader.split(' ');
    if (!token) {
        return res.status(401).json({ erro: 'Token nao fornecido' });
    }

    try {
        const secret = getJwtSecret(res);
        if (!secret) return;

        (req as any).user = jwt.verify(token, secret);
        return next();
    } catch {
        return res.status(401).json({ erro: 'Token invalido ou expirado' });
    }
};

export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return next();

    const [, token] = authHeader.split(' ');
    if (!token) return next();

    try {
        const secret = getJwtSecret(res);
        if (!secret) return;

        (req as any).user = jwt.verify(token, secret);
        return next();
    } catch {
        return res.status(401).json({ erro: 'Token invalido ou expirado' });
    }
};
