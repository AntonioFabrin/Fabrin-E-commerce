import { Request, Response } from 'express';
import reviewService from '../services/reviewService';

const reviewController = {

    // POST /api/reviews — criar avaliação
    create: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ erro: 'Não autenticado.' });

            const { product_id, order_id, rating, comment } = req.body;

            if (!product_id || !order_id || !rating) {
                return res.status(400).json({ erro: 'product_id, order_id e rating são obrigatórios.' });
            }

            const result = await reviewService.createReview({
                product_id: Number(product_id),
                user_id: userId,
                order_id: Number(order_id),
                rating: Number(rating),
                comment: String(comment || '').trim(),
            });

            return res.status(201).json(result);
        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    },

    // GET /api/reviews/product/:id — avaliações de um produto
    getByProduct: async (req: Request, res: Response) => {
        try {
            const productId = Number(req.params.id);
            const data = await reviewService.getProductReviews(productId);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(500).json({ erro: error.message });
        }
    },

    // POST /api/reviews/bulk-stats — médias de vários produtos (vitrine)
    bulkStats: async (req: Request, res: Response) => {
        try {
            const { productIds } = req.body;
            if (!Array.isArray(productIds)) {
                return res.status(400).json({ erro: 'productIds deve ser um array.' });
            }
            const stats = await reviewService.getStatsBulk(productIds.map(Number));
            return res.status(200).json(stats);
        } catch (error: any) {
            return res.status(500).json({ erro: error.message });
        }
    }
};

export default reviewController;
