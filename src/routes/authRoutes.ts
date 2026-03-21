import { Router } from 'express';
import authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware'; 
import { authorizeRole } from '../middlewares/roleMiddleware';

import { validate } from '../middlewares/validateMiddleware';
import { registerSchema } from '../validators/registerValidator';
import { loginSchema } from '../validators/loginValidator';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

router.get('/users', authMiddleware, authorizeRole(['admin']), authController.getAll);

router.put('/:id', authMiddleware, authController.update);
router.delete('/:id', authMiddleware, authController.delete);

export default router;