import { withAuth } from '@/middleware/authMiddleware';
import { 
  getProductByIdController, 
  updateProductController, 
  deleteProductController 
} from '@/controllers/product.controller';

export const GET = withAuth(async (request, context) => {
  return getProductByIdController(request, context);
});

export const PUT = withAuth(async (request, context) => {
  return updateProductController(request, context);
});

export const DELETE = withAuth(async (request, context) => {
  return deleteProductController(request, context);
});
