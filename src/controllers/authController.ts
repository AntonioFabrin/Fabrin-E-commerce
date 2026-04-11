import { Request, Response } from 'express';
import authService from '../services/authService';
import jwt from 'jsonwebtoken';

const authController = {
    register: async (req: Request, res: Response) => {
        try {
            const { name, email, password, role } = req.body;

            const novoUserId = await authService.registerUser({ name, email, password, role });
            return res.status(201).json({ mensagem: "Id criado com sucesso", id: novoUserId });
        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const user = await authService.login(email, password);
            const secret = process.env.JWT_SECRET;
            if (!secret) throw new Error('JWT_SECRET não configurado.');
            const token = jwt.sign (
            {id: user.id, email: user.email, role: user.role},
            secret,
            {expiresIn: '8h'}       
            );
            return res.status(200).json({
                mensagem: "Login conectado com sucesso!",
                token:token,
                user: {id: user.id, name: user.name, email: user.email, role: user.role}
            });
         } catch (error:any) {
            return res.status(401).json({ erro: error.message });
         }
    },

    // No seu authController.ts
update: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role, name, email } = req.body;

        await authService.updateUser(Number(id), { role, name, email });

        return res.json({ mensagem: "Usuário atualizado com sucesso!" });
    } catch (error: any) {
        return res.status(400).json({ erro: error.message });
    }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const targetId = parseInt(req.params.id as string);
            const userData = (req as any).user;

            if (targetId !== userData.id && userData.role !== 'admin') {
                return res.status(403).json({ 
                    erro: "Acesso negado! Você só pode deletar a sua própria conta." 
                });
            }

            await authService.deleteUser(targetId);

            return res.status(200).json({
                mensagem: `Usuário ${targetId} foi deletado com sucesso do sistema!`
            });
        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    },

    getAll: async (req: Request, res: Response) => {
    try { 
        const users = await authService.getAllUsers() as any[];

        return res.status(200).json({
            total: users.length,
            usuarios: users
        });
    } catch (error: any) {
        // Se cair aqui, ele vai mostrar a mensagem de erro do Service
        return res.status(400).json({ erro: error.message });
    }
},
}

export default authController;