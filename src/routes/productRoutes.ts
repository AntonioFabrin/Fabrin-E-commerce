import { Router } from 'express';
import productController from '../controllers/productController';
import { authMiddleware } from '../middlewares/authMiddleware'; 

const router = Router();

router.get('/', productController.getAll);
router.post('/create', authMiddleware, productController.create);
router.get('/:id', productController.getById);
router.put('/:id', authMiddleware, productController.update);
router.delete('/:id', authMiddleware, productController.delete);
export default router;