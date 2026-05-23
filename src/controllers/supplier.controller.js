import { NextResponse } from 'next/server';
import Supplier from '@/models/supplier.model';
import { ApiError } from '@/utils/ApiError';
import { ApiResponse } from '@/utils/ApiResponse';

// ─── Shared error handler ──────────────────────────────────────────────────────
async function handleRequest(serviceCall) {
  try {
    if (typeof global !== 'undefined' && global.mongoose) {
    }
    const result = await serviceCall();
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    console.error('Unhandled controller error:', error);
    return NextResponse.json(
      { success: false, statusCode: 500, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

// ─── Create Supplier ───────────────────────────────────────────────────────────
export async function createSupplierController(request, { user }) {
  return handleRequest(async () => {
    const { name } = await request.json();

    if (!name || !name.trim()) {
      throw new ApiError(400, 'Supplier name is required.');
    }

    const existingSupplier = await Supplier.findOne({ name: name.trim() });
    if (existingSupplier) {
      throw new ApiError(400, 'Supplier with this name already exists.');
    }

    const supplier = await Supplier.create({
      name: name.trim(),
      createdBy: user?.userId, // from withAuth
    });

    return new ApiResponse(201, supplier, 'Supplier created successfully');
  });
}

// ─── Get All Suppliers ─────────────────────────────────────────────────────────
export async function getAllSuppliersController() {
  return handleRequest(async () => {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    return new ApiResponse(200, suppliers, 'Suppliers fetched successfully');
  });
}
