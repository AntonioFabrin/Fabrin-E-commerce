import { Router } from 'express';
import productController from '../controllers/productController';
import { authMiddleware } from '../middlewares/authMiddleware'; 
import { authorizeRole } from '../middlewares/roleMiddleware';
import { upload } from '../utils/multerConfig';

const router = Router();

router.get('/', productController.getAll);
router.get('/:id', productController.getById);


router.post('/', authMiddleware, authorizeRole(['seller', 'admin']), upload.single('image'), productController.create);

router.put('/:id', authMiddleware, authorizeRole(['seller', 'admin']), productController.update);
router.delete('/:id', authMiddleware, authorizeRole(['seller', 'admin']), productController.delete);

export default router;