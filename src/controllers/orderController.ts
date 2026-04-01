import { Request, Response } from 'express';
import orderService from '../services/orderService';

const orderController = {

    // Criar pedido via carrinho (uso futuro)
    create: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const { items } = req.body;

            if (!userId) return res.status(400).json({ erro: 'Usuário não identificado.' });

            const result = await orderService.createOrder(userId, items);
            return res.status(201).json(result);
        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    },

    // Pedidos do comprador — "Meus Pedidos"
    listMyOrders: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const orders = await orderService.listUserOrders(userId);
            return res.status(200).json(orders);
        } catch (error: any) {
            return res.status(500).json({ erro: 'Erro ao buscar seus pedidos.' });
        }
    },

    // Pedidos recebidos pelo vendedor — "Pedidos Recebidos"
    listSellerOrders: async (req: Request, res: Response) => {
        try {
            const sellerId = (req as any).user?.id;
            const orders = await orderService.listSellerOrders(sellerId);
            return res.status(200).json(orders);
        } catch (error: any) {
            return res.status(500).json({ erro: 'Erro ao buscar pedidos recebidos.' });
        }
    }
};

export default orderController;
