import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { authenticate, isStaff } from "../middlewares/auth.middleware";

const productRouter = Router();

// Public routes
productRouter.get('/', ProductController.getProducts as any);
productRouter.get('/:id', ProductController.getProductById as any);
productRouter.get('/slug/:slug', ProductController.getProductBySlug as any);

// Protected routes
productRouter.post('/', authenticate, isStaff, ProductController.createProduct as any);
productRouter.put('/:id', authenticate, isStaff, ProductController.updateProduct as any);
productRouter.delete('/:id', authenticate, isStaff, ProductController.deleteProduct as any);
productRouter.patch('/:id/stock', authenticate, isStaff, ProductController.updateProductStock as any);

export default productRouter;