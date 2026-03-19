import db from '../config/database';

const orderRepository = {
    createOrder: async (userId:number, total:number, items: any []) =>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const orderQuery = 'INSERT INTO orders (user_id, total)VALUES (?, ?)';
            const [orderResult]: any = await connection.execute (orderQuery, [userId, total]);

            const orderId = orderResult.insertId;

            const itemQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
            for (const item of items) {
                await connection.execute(itemQuery,[
                    orderId,
                    item.product_id,
                    item.quantity,
                    item.price
                ]);
            }
            await connection.commit();
            return orderId;
        } catch (error) {
            await connection.rollback();
            console.error("Erro na transação de pedidos:",error);
            throw error;
        } finally{
            connection.release();
        }
    },

    getUserOrders: async (userId: number) => {
        console.log("📍 2. Repository: Montando a query SQL...");
        
        const query = `
            SELECT o.id, o.total, o.status, o.created_at,
                   JSON_ARRAYAGG(
                       JSON_OBJECT(
                           'product_id', oi.product_id,
                           'quantity', oi.quantity,
                           'price', oi.price,
                           'product_name', p.name
                       )
                   ) as items
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;
        
        console.log("📍 3. Repository: Disparando query pro Banco de Dados...");
        
        const [rows] = await db.execute(query, [userId]); 
        
        console.log("📍 3.1 Repository: O Banco de Dados respondeu perfeitamente!");
        return rows as any[];
    }
};

export default orderRepository;