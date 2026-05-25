import { withAuth } from '@/middleware/authMiddleware';
import { deleteRawGuideImageController } from '@/controllers/platformSettings.controller';

export const DELETE = withAuth(async (request, context) => {
  return deleteRawGuideImageController(request, context);
});
