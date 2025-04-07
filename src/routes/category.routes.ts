import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, isStaff } from '../middlewares/auth.middleware';

const categoryRouter = Router();

// Public routes
categoryRouter.get('/', CategoryController.getCategories as any);
categoryRouter.get('/:id', CategoryController.getCategoryById as any);
categoryRouter.get('/slug/:slug', CategoryController.getCategoryBySlug as any);

// Protected routes
categoryRouter.post(
  '/',
  authenticate,
  isStaff,
  CategoryController.createCategory as any
);
categoryRouter.put(
  '/:id',
  authenticate,
  isStaff,
  CategoryController.updateCategory as any
);
categoryRouter.delete(
  '/:id',
  authenticate,
  isStaff,
  CategoryController.deleteCategory as any
);

export default categoryRouter;