import { Request, Response } from 'express';
import authService from '../services/authService';
import jwt from 'jsonwebtoken';

const authController = {
    register: async (req: Request, res: Response) => {
        console.log("1. Chegou no Controller. Body:", req.body);
        try {
            const { name, email, password, role } = req.body;
            console.log("2. Variáveis extraídas:", { name, email, password, role });

            const novoUserId = await authService.registerUser({ name, email, password, role });
            return res.status(201).json({ mensagem: "Id criado com sucesso", id: novoUserId });
        } catch (error: any) {
            console.error("ERRO NO CONTROLLER:", error.message);
            return res.status(400).json({ erro: error.message });
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            console.log("🕵️ Tentando logar com os dados:");
            const { email, password } = req.body;
            const user = await authService.login(email, password);
            const secret = process.env.JWT_SECRET || 'XT_WS_%*924=23=lufa';
            const token = jwt.sign (
            {id: user.id, email: user.email, role: user.role},
            secret,
            {expiresIn: '8h'}       
            );
            return res.status(200).json({
                mensagem: "Login conectado com sucesso!",
                token:token,
                user: {id: user.id, name:user.name, email:user.email}
            });
         } catch (error:any) {
            return res.status(401).json({ erro: error.message });
         }
    },

    update: async (req: Request, res: Response) => {
        try {
            const { id } = req.params; 
            const { name, email } = req.body;

            await authService.updateUser(Number(id),{name, email});

            return res.json
            ({ mensagem: `Usuário ${id} atualizado!`,
            dadosNovos: {name, email}
        });
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

            console.log(`⚖️ Executando exclusão do usuário ID: ${targetId}...`);
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
        console.log("🔍 Buscando todos os usuários cadastrados... ");
        
        // Ele tem que chamar o Service SEM passar parâmetros (tipo email)
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