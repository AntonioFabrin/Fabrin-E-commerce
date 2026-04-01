import db from '../config/database';

const reviewRepository = {

    // Criar avaliação
    create: async (data: {
        product_id: number;
        user_id: number;
        order_id: number;
        rating: number;
        comment: string;
    }) => {
        const [result]: any = await db.execute(
            `INSERT INTO reviews (product_id, user_id, order_id, rating, comment)
             VALUES (?, ?, ?, ?, ?)`,
            [data.product_id, data.user_id, data.order_id, data.rating, data.comment]
        );
        return result.insertId;
    },

    // Buscar todas as avaliações de um produto (com nome do usuário)
    findByProduct: async (productId: number) => {
        const [rows] = await db.execute(
            `SELECT r.id, r.rating, r.comment, r.created_at,
                    u.name AS user_name
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ?
             ORDER BY r.created_at DESC`,
            [productId]
        );
        return rows as any[];
    },

    // Média e total de avaliações de um produto
    getStats: async (productId: number) => {
        const [rows]: any = await db.execute(
            `SELECT 
                COUNT(*)            AS total,
                ROUND(AVG(rating), 1) AS average,
                SUM(rating = 5)     AS stars5,
                SUM(rating = 4)     AS stars4,
                SUM(rating = 3)     AS stars3,
                SUM(rating = 2)     AS stars2,
                SUM(rating = 1)     AS stars1
             FROM reviews
             WHERE product_id = ?`,
            [productId]
        );
        return (rows as any[])[0];
    },

    // Buscar médias de múltiplos produtos de uma vez (para a vitrine)
    getStatsBulk: async (productIds: number[]) => {
        if (!productIds.length) return [];
        const placeholders = productIds.map(() => '?').join(',');
        const [rows] = await db.execute(
            `SELECT product_id,
                    COUNT(*)              AS total,
                    ROUND(AVG(rating), 1) AS average
             FROM reviews
             WHERE product_id IN (${placeholders})
             GROUP BY product_id`,
            productIds
        );
        return rows as any[];
    },

    // Verificar se usuário já avaliou este produto neste pedido
    alreadyReviewed: async (userId: number, productId: number, orderId: number) => {
        const [rows]: any = await db.execute(
            `SELECT id FROM reviews
             WHERE user_id = ? AND product_id = ? AND order_id = ?
             LIMIT 1`,
            [userId, productId, orderId]
        );
        return (rows as any[]).length > 0;
    },

    // Verificar se o usuário comprou o produto (segurança)
    userBoughtProduct: async (userId: number, productId: number) => {
        const [rows]: any = await db.execute(
            `SELECT o.id FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             WHERE o.user_id = ? AND oi.product_id = ?
             LIMIT 1`,
            [userId, productId]
        );
        return (rows as any[]).length > 0;
    }
};

export default reviewRepository;
