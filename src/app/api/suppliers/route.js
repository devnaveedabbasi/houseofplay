import { withAuth } from '@/middleware/authMiddleware';
import { createSupplierController, getAllSuppliersController } from '@/controllers/supplier.controller';

export const POST = withAuth(async (request, context) => {
  return createSupplierController(request, context);
});

export const GET = withAuth(async (request, context) => {
  return getAllSuppliersController(request, context);
});
