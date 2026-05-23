import { withAuth } from '@/middleware/authMiddleware';
import {
  getThemeByIdController,
  updateThemeController,
  deleteThemeController,
} from '@/controllers/theme.controller';

export const GET = withAuth(async (request, context) => {
  return getThemeByIdController(request, context);
});

export const PUT = withAuth(async (request, context) => {
  return updateThemeController(request, context);
});

export const DELETE = withAuth(async (request, context) => {
  return deleteThemeController(request, context);
});
