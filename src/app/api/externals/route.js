import { withAuth } from '@/middleware/authMiddleware';
import { createExternalController, getAllExternalsController } from '@/controllers/external.controller';

export const POST = withAuth(async (request, context) => {
  return createExternalController(request, context);
});

export const GET = withAuth(async (request, context) => {
  return getAllExternalsController(request, context);
});
