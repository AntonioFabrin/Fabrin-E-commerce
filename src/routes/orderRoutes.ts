import { Router } from 'express';
import orderController from '../controllers/orderController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Criar pedido via carrinho
router.post('/', authMiddleware, orderController.create);

// Pedidos do comprador — "Meus Pedidos"
router.get('/my', authMiddleware, orderController.listMyOrders);

// Pedidos recebidos pelo vendedor — "Pedidos Recebidos"
router.get('/seller', authMiddleware, orderController.listSellerOrders);

export default router;
