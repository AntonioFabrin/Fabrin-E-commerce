import { Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        return res.status(401).json ({erro: 'Token não fornecido'});
    }
    const parts = authHeader.split(' ');
    const token = parts [1];
    console.log("🕵️ Token que chegou no middleware:", token);
    try{
        const secret = process.env.JWT_SECRET || 'XT_WS_%*924=23=lufa';
        const decoded: any = jwt.verify(token,secret);
        (req as any).user = decoded;
        return next();
    } catch (err) {
        console.error("🚨 Motivo da recusa do Token:", err);
        return res.status(401).json ({erro: 'Token inválido ou expirado'});
    };
}