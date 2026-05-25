import { withAuth } from '@/middleware/authMiddleware';
import { uploadRawGuideImagesController } from '@/controllers/platformSettings.controller';

export const POST = withAuth(async (request, context) => {
  return uploadRawGuideImagesController(request, context);
});
