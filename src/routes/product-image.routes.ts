import { Router } from 'express';
import { ProductImageController } from '../controllers/product-image.controller';
import { authenticate, isStaff } from '../middlewares/auth.middleware';

const productImageRouter = Router();

// Routes to handle product images
productImageRouter.get(
  '/:productId/images',
  ProductImageController.getProductImages as any
);
productImageRouter.post(
  '/:productId/images',
  authenticate,
  isStaff,
  ProductImageController.addProductImage as any
);

// Routes to handle individual product images
productImageRouter.put(
  '/images/:imageId',
  authenticate,
  isStaff,
  ProductImageController.updateImage as any
);
productImageRouter.delete(
  '/images/:imageId',
  authenticate,
  isStaff,
  ProductImageController.deleteImage as any
);
productImageRouter.patch(
  '/images/:imageId/set-main',
  authenticate,
  isStaff,
  ProductImageController.setMainImage as any
);

export default productImageRouter;
