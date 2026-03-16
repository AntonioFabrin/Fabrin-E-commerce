import { Router } from 'express';
import authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware'; 

const router = Router();

// Rotas abertas (Qualquer um acessa)
router.post('/register', authController.register);
router.post('/login', authController.login);

router.put('/update/:id', authMiddleware, authController.update);
router.delete('/delete/:id', authMiddleware, authController.delete);
router.get('/users', authMiddleware, authController.getAll);
export default router;