import { withAuth } from '@/middleware/authMiddleware';
import { 
  getProductsController, 
  createProductController 
} from '@/controllers/product.controller';

export const GET = withAuth(async (request, context) => {
  return getProductsController(request, context);
});

export const POST = withAuth(async (request, context) => {
  return createProductController(request, context);
});
