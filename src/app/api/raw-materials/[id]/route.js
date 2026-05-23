import { withAuth } from '@/middleware/authMiddleware';
import { 
  getRawMaterialByIdController, 
  updateRawMaterialController, 
  deleteRawMaterialController 
} from '@/controllers/rawMaterial.controller';

export const GET = withAuth(async (request, context) => {
  return getRawMaterialByIdController(request, context);
});

export const PUT = withAuth(async (request, context) => {
  return updateRawMaterialController(request, context);
});

export const DELETE = withAuth(async (request, context) => {
  return deleteRawMaterialController(request, context);
});
