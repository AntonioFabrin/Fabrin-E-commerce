import db from '../config/database';

const safe = (val: any, fallback = 0) => {
    const n = Number(val);
    return isNaN(n) ? fallback : n;
};

const sellerRepository = {

    findPublicProfile: async (sellerId: number) => {
        const [rows]: any = await db.execute(
            `SELECT id, name, created_at FROM users WHERE id = ? LIMIT 1`,
            [sellerId]
        );
        return (rows as any[])[0] || null;
    },

    findProductsWithStats: async (sellerId: number) => {
        const [rows] = await db.execute(
            `SELECT 
                p.id, p.name, p.description, p.price, p.stock, p.image_url,
                COUNT(r.id)             AS review_count,
                ROUND(AVG(r.rating), 1) AS review_avg
             FROM products p
             LEFT JOIN reviews r ON r.product_id = p.id
             WHERE p.seller_id = ? AND p.stock > 0
             GROUP BY p.id
             ORDER BY p.id DESC`,
            [sellerId]
        );
        return rows as any[];
    },

    findRecentReviews: async (sellerId: number, limit = 6) => {
        const [rows] = await db.execute(
            `SELECT 
                r.id, r.rating, r.comment, r.created_at,
                u.name AS buyer_name,
                p.name AS product_name,
                p.id   AS product_id
             FROM reviews r
             JOIN products p ON p.id = r.product_id
             JOIN users    u ON u.id = r.user_id
             WHERE p.seller_id = ?
             ORDER BY r.created_at DESC
             LIMIT ?`,
            [sellerId, limit]
        );
        return rows as any[];
    },

    findStats: async (sellerId: number) => {
        const [[productStats]]: any = await db.execute(
            `SELECT COUNT(*) AS total_products, COALESCE(SUM(stock), 0) AS total_stock
             FROM products WHERE seller_id = ?`,
            [sellerId]
        );
        const [[reviewStats]]: any = await db.execute(
            `SELECT COUNT(r.id) AS total_reviews, COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating
             FROM reviews r JOIN products p ON p.id = r.product_id WHERE p.seller_id = ?`,
            [sellerId]
        );
        const [[salesStats]]: any = await db.execute(
            `SELECT COUNT(DISTINCT o.id) AS total_sales
             FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             JOIN products p     ON p.id = oi.product_id
             WHERE p.seller_id = ? AND o.status = 'paid'`,
            [sellerId]
        );
        return {
            total_products: safe(productStats?.total_products),
            total_reviews:  safe(reviewStats?.total_reviews),
            avg_rating:     safe(reviewStats?.avg_rating),
            total_sales:    safe(salesStats?.total_sales),
        };
    },

    // ── ANALYTICS ──────────────────────────────────────────────────────────────

    getRevenueByMonth: async (sellerId: number) => {
        const [rows] = await db.execute(
            `SELECT 
                DATE_FORMAT(o.created_at, '%Y-%m')               AS month,
                DATE_FORMAT(o.created_at, '%b/%y')               AS label,
                ROUND(SUM(oi.price * oi.quantity), 2)            AS revenue,
                COUNT(DISTINCT o.id)                             AS orders
             FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             JOIN products p     ON p.id = oi.product_id
             WHERE p.seller_id = ?
               AND o.status = 'paid'
               AND o.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
             GROUP BY DATE_FORMAT(o.created_at, '%Y-%m'), DATE_FORMAT(o.created_at, '%b/%y')
             ORDER BY month ASC`,
            [sellerId]
        );
        return rows as any[];
    },

    getTopProducts: async (sellerId: number) => {
        const [rows] = await db.execute(
            `SELECT 
                p.name,
                COALESCE(SUM(oi.quantity), 0)                      AS units_sold,
                COALESCE(ROUND(SUM(oi.price * oi.quantity), 2), 0) AS revenue
             FROM order_items oi
             JOIN orders   o ON o.id  = oi.order_id
             JOIN products p ON p.id  = oi.product_id
             WHERE p.seller_id = ? AND o.status = 'paid'
             GROUP BY p.id, p.name
             ORDER BY revenue DESC
             LIMIT 5`,
            [sellerId]
        );
        return rows as any[];
    },

    getOrdersByStatus: async (sellerId: number) => {
        const [rows] = await db.execute(
            `SELECT 
                o.status,
                COUNT(DISTINCT o.id) AS count
             FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             JOIN products p     ON p.id = oi.product_id
             WHERE p.seller_id = ?
             GROUP BY o.status`,
            [sellerId]
        );
        return rows as any[];
    },

    getRatingDistribution: async (sellerId: number) => {
        const [rows] = await db.execute(
            `SELECT 
                r.rating,
                COUNT(*) AS count
             FROM reviews r
             JOIN products p ON p.id = r.product_id
             WHERE p.seller_id = ?
             GROUP BY r.rating
             ORDER BY r.rating DESC`,
            [sellerId]
        );
        return rows as any[];
    },

    getKpis: async (sellerId: number) => {
        // COALESCE garante 0 quando não há dados (SUM/AVG retornam NULL sem linhas)
        const [[total]]: any = await db.execute(
            `SELECT 
                COALESCE(ROUND(SUM(oi.price * oi.quantity), 2), 0) AS revenue_total,
                COUNT(DISTINCT o.id)                               AS orders_paid
             FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             JOIN products p     ON p.id = oi.product_id
             WHERE p.seller_id = ? AND o.status = 'paid'`,
            [sellerId]
        );

        const [[month]]: any = await db.execute(
            `SELECT 
                COALESCE(ROUND(SUM(oi.price * oi.quantity), 2), 0) AS revenue_month,
                COUNT(DISTINCT o.id)                               AS orders_month
             FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             JOIN products p     ON p.id = oi.product_id
             WHERE p.seller_id = ?
               AND o.status = 'paid'
               AND MONTH(o.created_at) = MONTH(NOW())
               AND YEAR(o.created_at)  = YEAR(NOW())`,
            [sellerId]
        );

        const [[pending]]: any = await db.execute(
            `SELECT COUNT(DISTINCT o.id) AS orders_pending
             FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             JOIN products p     ON p.id = oi.product_id
             WHERE p.seller_id = ? AND o.status = 'pending'`,
            [sellerId]
        );

        // Ticket médio calculado no JS — evita subquery aninhada com mysql2
        const [orderTotals]: any = await db.execute(
            `SELECT COALESCE(SUM(oi.price * oi.quantity), 0) AS order_total
             FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             JOIN products p     ON p.id = oi.product_id
             WHERE p.seller_id = ? AND o.status = 'paid'
             GROUP BY o.id`,
            [sellerId]
        );

        const totals = (orderTotals as any[]).map(r => safe(r.order_total));
        const avgTicket = totals.length > 0
            ? Math.round((totals.reduce((a: number, b: number) => a + b, 0) / totals.length) * 100) / 100
            : 0;

        return {
            revenue_total:  safe(total?.revenue_total),
            orders_paid:    safe(total?.orders_paid),
            revenue_month:  safe(month?.revenue_month),
            orders_month:   safe(month?.orders_month),
            orders_pending: safe(pending?.orders_pending),
            avg_ticket:     avgTicket,
        };
    }
};

export default sellerRepository;
