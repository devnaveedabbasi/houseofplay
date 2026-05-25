import { withAuth } from '@/middleware/authMiddleware';
import { uploadMadeGuideImagesController } from '@/controllers/platformSettings.controller';

export const POST = withAuth(async (request, context) => {
  return uploadMadeGuideImagesController(request, context);
});
