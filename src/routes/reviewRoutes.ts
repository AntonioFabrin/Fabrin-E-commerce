import { Router } from 'express';
import reviewController from '../controllers/reviewController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Criar avaliação — precisa estar logado
router.post('/', authMiddleware, reviewController.create);

// Buscar avaliações de um produto — público
router.get('/product/:id', reviewController.getByProduct);

// Médias em bulk para a vitrine — público
router.post('/bulk-stats', reviewController.bulkStats);

export default router;
