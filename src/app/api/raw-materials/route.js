import { withAuth } from '@/middleware/authMiddleware';
import { createRawMaterialController, getAllRawMaterialsController } from '@/controllers/rawMaterial.controller';

export const POST = withAuth(async (request, context) => {
  return createRawMaterialController(request, context);
});

export const GET = withAuth(async (request, context) => {
  return getAllRawMaterialsController(request, context);
});
