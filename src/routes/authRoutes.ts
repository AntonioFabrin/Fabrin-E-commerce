import { Router } from 'express';
import authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware'; 
import { authorizeRole } from '../middlewares/roleMiddleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/users', authMiddleware, authorizeRole(['admin']), authController.getAll);

router.put('/:id', authMiddleware, authController.update);
router.delete('/:id', authMiddleware, authController.delete);

export default router;