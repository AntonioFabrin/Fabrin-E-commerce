import { Request, Response } from "express";
import orderService from "../services/orderService";



const orderController = {
    create: async (req: Request, res: Response) => {
        try {
            // 1. Pegamos a prancheta inteira que o Porteiro mandou
            const usuarioCompleto = (req as any).user;
            
            // 2. Imprimimos a prancheta inteira para ver o que tem dentro!
            console.log("📦 Prancheta que chegou do Porteiro:", usuarioCompleto);

            // 3. Tentamos pegar o ID com segurança
            const userId = usuarioCompleto ? usuarioCompleto.id : undefined;
            console.log("🕵️‍♂️ UserID extraído:", userId);

            // Pegamos a lista de compras
            const { items } = req.body;
            console.log("🛒 Itens que vieram do Insomnia:", items);

            // 🚨 Se o ID continuar undefined, a gente trava aqui pra não dar erro feio no banco
            if (!userId) {
                return res.status(400).json({ erro: "Socorro! O ID do usuário sumiu no caminho!" });
            }

            console.log(`Processando novo pedido para o usuário ID: ${userId}...`);
            // ... DAQUI PRA BAIXO O SEU CÓDIGO CONTINUA IGUAL (const result = await orderService...)
            const result = await orderService.createOrder(userId, items);
            return res.status (201).json (result);
        } catch (error: any) {
            console.error("❌ Erro no checkout:", error.message);
            return res.status(400).json({erro:error.message});
        }
    },

    listMyOrders: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            console.log(`📍 1. Controller: Buscando histórico do usuário ID: ${userId}...`);

            const orders = await orderService.listUserOrders(userId);

            console.log(`📍 4. Controller: Sucesso! Devolvendo ${orders.length} pedido(s) para o Insomnia.`);
            
            return res.status(200).json(orders);

        } catch (error: any) {
            console.error("❌ Erro no Controller:", error);
            return res.status(500).json({ erro: "Erro interno ao buscar seus pedidos." });
        }
    }
};

export default orderController;