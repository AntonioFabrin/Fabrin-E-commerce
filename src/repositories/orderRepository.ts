import db from '../config/database';

const orderRepository = {

    // ─── CRIAR PEDIDO + ITENS (transação) ───────────────────────────────────────
    createOrder: async (userId: number, total: number, items: any[]) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [orderResult]: any = await connection.execute(
                'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
                [userId, total, 'pending']
            );
            const orderId = orderResult.insertId;

            for (const item of items) {
                await connection.execute(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.product_id, item.quantity, item.price]
                );
            }

            await connection.commit();
            return orderId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // ─── SALVAR EXTERNAL_REFERENCE NO PEDIDO ────────────────────────────────────
    saveExternalReference: async (orderId: number, externalReference: string) => {
        await db.execute(
            'UPDATE orders SET external_reference = ? WHERE id = ?',
            [externalReference, orderId]
        );
    },

    // ─── GRAVAR PAGAMENTO ────────────────────────────────────────────────────────
    createPayment: async (orderId: number, method: string, status: string, transactionId: string) => {
        const [result]: any = await db.execute(
            'INSERT INTO payments (order_id, payment_method, payment_status, transaction_id) VALUES (?, ?, ?, ?)',
            [orderId, method, status, transactionId]
        );
        return result.insertId;
    },

    // ─── ATUALIZAR STATUS DO PEDIDO ──────────────────────────────────────────────
    updateOrderStatus: async (orderId: number, status: string) => {
        await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    },

    // ─── ATUALIZAR STATUS DO PAGAMENTO ───────────────────────────────────────────
    updatePaymentStatus: async (transactionId: string, status: string) => {
        await db.execute(
            'UPDATE payments SET payment_status = ? WHERE transaction_id = ?',
            [status, transactionId]
        );
    },

    // ─── BUSCAR PEDIDO POR EXTERNAL_REFERENCE ────────────────────────────────────
    findByExternalReference: async (externalRef: string) => {
        const [rows]: any = await db.execute(
            'SELECT * FROM orders WHERE external_reference = ? LIMIT 1',
            [externalRef]
        );
        return (rows as any[])[0] || null;
    },

    // ─── BUSCAR PEDIDO POR TRANSACTION_ID (payment) ──────────────────────────────
    findByTransactionId: async (transactionId: string) => {
        const [rows]: any = await db.execute(
            `SELECT o.* FROM orders o
             JOIN payments p ON p.order_id = o.id
             WHERE p.transaction_id = ? LIMIT 1`,
            [transactionId]
        );
        return (rows as any[])[0] || null;
    },

    // ─── PEDIDOS DO COMPRADOR ────────────────────────────────────────────────────
    getUserOrders: async (userId: number) => {
        const query = `
            SELECT 
                o.id,
                o.total,
                o.status,
                o.external_reference,
                o.created_at,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'product_id',   oi.product_id,
                        'quantity',     oi.quantity,
                        'price',        oi.price,
                        'product_name', p.name,
                        'image_url',    p.image_url
                    )
                ) AS items,
                (SELECT pay.payment_method FROM payments pay WHERE pay.order_id = o.id ORDER BY pay.id DESC LIMIT 1) AS payment_method,
                (SELECT pay.payment_status FROM payments pay WHERE pay.order_id = o.id ORDER BY pay.id DESC LIMIT 1) AS payment_status
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p     ON oi.product_id = p.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;
        const [rows] = await db.execute(query, [userId]);
        return rows as any[];
    },

    // ─── PEDIDOS RECEBIDOS DO VENDEDOR ───────────────────────────────────────────
    getSellerOrders: async (sellerId: number) => {
        const query = `
            SELECT
                o.id,
                o.total,
                o.status,
                o.external_reference,
                o.created_at,
                u.name  AS buyer_name,
                u.email AS buyer_email,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'product_id',   oi.product_id,
                        'product_name', p.name,
                        'quantity',     oi.quantity,
                        'price',        oi.price,
                        'image_url',    p.image_url
                    )
                ) AS items,
                (SELECT pay.payment_method FROM payments pay WHERE pay.order_id = o.id ORDER BY pay.id DESC LIMIT 1) AS payment_method,
                (SELECT pay.payment_status FROM payments pay WHERE pay.order_id = o.id ORDER BY pay.id DESC LIMIT 1) AS payment_status
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p     ON oi.product_id = p.id
            JOIN users u        ON o.user_id = u.id
            WHERE p.seller_id = ?
            GROUP BY o.id, u.name, u.email
            ORDER BY o.created_at DESC
        `;
        const [rows] = await db.execute(query, [sellerId]);
        return rows as any[];
    }
};

export default orderRepository;
