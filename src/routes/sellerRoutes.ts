import { Router } from 'express';
import sellerController from '../controllers/sellerController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// ✅ /analytics DEVE vir ANTES de /:id/profile
// senão o Express interpreta "analytics" como um :id
router.get('/analytics', authMiddleware, sellerController.getAnalytics);
router.get('/:id/profile', sellerController.getProfile);

export default router;
