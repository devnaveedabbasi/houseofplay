import { withAuth } from '@/middleware/authMiddleware';
import { bulkUpdateProductStatusController } from '@/controllers/product.controller';

export const PATCH = withAuth(async (request, context) => {
  return bulkUpdateProductStatusController(request, context);
});
