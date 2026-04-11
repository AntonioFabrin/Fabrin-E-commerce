import { Request, Response } from 'express';
import sellerService from '../services/sellerService';

const sellerController = {

    getProfile: async (req: Request, res: Response) => {
        try {
            const sellerId = Number(req.params.id);
            if (isNaN(sellerId)) return res.status(400).json({ erro: 'ID inválido.' });

            const data = await sellerService.getPublicProfile(sellerId);
            return res.status(200).json(data);

        } catch (error: any) {
            const isNotFound = error.message === 'Vendedor não encontrado.';
            return res.status(isNotFound ? 404 : 500).json({ erro: error.message });
        }
    },

    getAnalytics: async (req: Request, res: Response) => {
        try {
            const sellerId = (req as any).user?.id;
            if (!sellerId) return res.status(401).json({ erro: 'Não autenticado.' });

            const data = await sellerService.getAnalytics(sellerId);
            return res.status(200).json(data);

        } catch (error: any) {
            return res.status(500).json({
                erro: 'Erro ao carregar dados financeiros.',
                detalhe: error?.message,
            });
        }
    },
};

export default sellerController;
