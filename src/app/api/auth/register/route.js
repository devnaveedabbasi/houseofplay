import { NextResponse } from "next/server";
import { registerController } from "@/controllers/auth.controller";

/**
 * POST /api/auth/register
 * Public route — no authentication required.
 */
export async function POST(request) {
  try {
    const result = await registerController(request);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const status = error?.statusCode || 500;
    const message = error?.message || "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status });
  }
}