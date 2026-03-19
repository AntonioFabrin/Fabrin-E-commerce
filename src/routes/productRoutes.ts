import { Router } from 'express';
import productController from '../controllers/productController';
import { authMiddleware } from '../middlewares/authMiddleware'; 
import { authorizeRole } from '../middlewares/roleMiddleware';

const router = Router();

router.get('/:id', productController.getById);
router.get('/', productController.getAll);


router.post('/create', authMiddleware, authorizeRole(['seller', 'admin']), productController.create);
router.put('/:id', authMiddleware, authorizeRole(['seller', 'admin']), productController.update);
router.delete('/:id', authMiddleware, authorizeRole(['seller', 'admin']), productController.delete);


export default router;