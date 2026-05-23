import { withAuth } from '@/middleware/authMiddleware';
import {
  getExternalByIdController,
  updateExternalController,
  deleteExternalController,
} from '@/controllers/external.controller';

export const GET = withAuth(async (request, context) => {
  return getExternalByIdController(request, context);
});

export const PUT = withAuth(async (request, context) => {
  return updateExternalController(request, context);
});

export const DELETE = withAuth(async (request, context) => {
  return deleteExternalController(request, context);
});
