import { withAuth } from '@/middleware/authMiddleware';
import { getSettingsController } from '@/controllers/platformSettings.controller';

export const GET = withAuth(async (request, context) => {
  return getSettingsController(request, context);
});
