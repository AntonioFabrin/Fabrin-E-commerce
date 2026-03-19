import {Request,Response,NextFunction} from 'express';

export const authorizeRole = (allowedRoles: string []) => {
    return (req:Request, res:Response, next:NextFunction) => {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json ({erro:"Usuário não autenticado"});
        }
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json ({
                erro:"Acesso negado! Você não tem permissão para fazer isso."
            });
        }
        next();
    };
}
