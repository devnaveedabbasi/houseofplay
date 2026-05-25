import { withAuth } from '@/middleware/authMiddleware';
import { deleteMadeGuideImageController } from '@/controllers/platformSettings.controller';

export const DELETE = withAuth(async (request, context) => {
  return deleteMadeGuideImageController(request, context);
});
