import { Router } from "express";
import orderController from "../controllers/orderController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router ();

router.post ('/', authMiddleware, orderController.create);

router.get('/orders', authMiddleware, orderController.listMyOrders);


export default router;