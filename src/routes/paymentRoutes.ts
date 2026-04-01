import { Router } from 'express';
import paymentController from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Produto único — tenta pegar token mas não exige
router.post('/preference', authMiddleware, paymentController.createPreference);

// Carrinho com múltiplos itens — tenta pegar token mas não exige
router.post('/preference-cart', authMiddleware, paymentController.createPreferenceCart);

// Webhook público — o MP chama sem autenticação
router.post('/webhook', paymentController.webhook);

export default router;
