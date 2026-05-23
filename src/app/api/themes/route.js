import { withAuth } from '@/middleware/authMiddleware';
import { createThemeController, getAllThemesController } from '@/controllers/theme.controller';

export const POST = withAuth(async (request, context) => {
  return createThemeController(request, context);
});

export const GET = withAuth(async (request, context) => {
  return getAllThemesController(request, context);
});
