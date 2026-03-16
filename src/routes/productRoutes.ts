import { Router } from 'express';
import productController from '../controllers/productController';
import { authMiddleware } from '../middlewares/authMiddleware'; 

const router = Router();

router.post('/create', authMiddleware, productController.create);

export default router;