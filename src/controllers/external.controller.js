import { NextResponse } from 'next/server';
import External from '@/models/external.model';
import { ApiError } from '@/utils/ApiError';
import { ApiResponse } from '@/utils/ApiResponse';
// CLOUDINARY CODE COMMENTED FOR TESTING
// import { uploadToCloudinary } from '@/config/cloudinary';

// LOCAL UPLOAD (testing only)
import fs from 'fs';
import path from 'path';
import { uploadToLocal } from '@/config/cloudinary';

// ─── Shared error handler ──────────────────────────────────────────────────────
async function handleRequest(serviceCall) {
  try {
    const result = await serviceCall();
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    console.error('Unhandled controller error:', error);
    return NextResponse.json(
      { success: false, statusCode: 500, message: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}

// Helper to convert File to Buffer
async function fileToBuffer(file) {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ─── Create External ───────────────────────────────────────────────────────────
export async function createExternalController(request, { user }) {
  return handleRequest(async () => {
    const formData = await request.formData();

    // Text fields
    const productName = formData.get('productName');
    const standard = formData.get('standard') === 'true';
    const description = formData.get('description');
    const denominationPackSize = Number(formData.get('denominationPackSize'));
    const externalPrice = Number(formData.get('externalPrice'));
    const supplier = formData.get('supplier');
    const supplierSKU = formData.get('supplierSKU');
    const sku = formData.get('sku');

    const measurementsRaw = formData.get('measurements');
    let measurements = {};
    if (measurementsRaw) {
      measurements = JSON.parse(measurementsRaw);
    }

    if (!productName || isNaN(denominationPackSize) || isNaN(externalPrice)) {
      throw new ApiError(400, 'productName, denominationPackSize, and externalPrice are required.');
    }

    // Handle single file
    const thumbnailFile = formData.get('thumbnail');
    let thumbnailUrl = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      const buffer = await fileToBuffer(thumbnailFile);
      // CLOUDINARY (production)
      // const result = await uploadToCloudinary(buffer, 'externals/thumbnails');
      // thumbnailUrl = result.url;

      // LOCAL (testing)
      const filename = `${Date.now()}-${thumbnailFile.name || 'thumb.jpg'}`;
      thumbnailUrl = uploadToLocal(buffer, "product/external", filename);
    }

    // Create external
    const external = await External.create({
      productName,
      standard,
      description,
      denominationPackSize,
      thumbnail: thumbnailUrl,
      measurements,
      supplier, // assuming it's an ObjectId string
      externalPrice,
      supplierSKU,
      sku,
      createdBy: user?.userId,
    });

    return new ApiResponse(201, external, 'External added successfully');
  });
}

// ─── Get All Externals ─────────────────────────────────────────────────────────
export async function getAllExternalsController(request) {
  return handleRequest(async () => {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const externals = await External.find()
      .populate('supplier', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await External.countDocuments();
    const pages = Math.ceil(total / limit);

    return new ApiResponse(200, {
      externals,
      total,
      page,
      pages,
    }, 'Externals fetched successfully');
  });
}

// ─── Get External By ID ────────────────────────────────────────────────────────
export async function getExternalByIdController(request, { params }) {
  return handleRequest(async () => {
    const { id } = await params;
    const external = await External.findById(id).populate('supplier', 'name');

    if (!external) {
      throw new ApiError(404, 'External not found');
    }

    return new ApiResponse(200, external, 'External fetched successfully');
  });
}

// ─── Update External ───────────────────────────────────────────────────────────
export async function updateExternalController(request, { params }) {
  return handleRequest(async () => {
    const { id } = await params;
    const external = await External.findById(id);

    if (!external) {
      throw new ApiError(404, 'External not found');
    }

    const formData = await request.formData();

    // Basic text fields update
    if (formData.has('productName')) external.productName = formData.get('productName');
    if (formData.has('standard')) external.standard = formData.get('standard') === 'true';
    if (formData.has('description')) external.description = formData.get('description');
    if (formData.has('denominationPackSize')) external.denominationPackSize = Number(formData.get('denominationPackSize'));
    if (formData.has('externalPrice')) external.externalPrice = Number(formData.get('externalPrice'));
    if (formData.has('supplier')) external.supplier = formData.get('supplier');
    if (formData.has('supplierSKU')) external.supplierSKU = formData.get('supplierSKU');
    if (formData.has('sku')) external.sku = formData.get('sku');

    if (formData.has('measurements')) {
      external.measurements = JSON.parse(formData.get('measurements'));
    }

    // Handle files
    const thumbnailFile = formData.get('thumbnail');
    if (thumbnailFile && thumbnailFile.size > 0) {
      const buffer = await fileToBuffer(thumbnailFile);
      // CLOUDINARY (production)
      // const result = await uploadToCloudinary(buffer, 'externals/thumbnails');
      // external.thumbnail = result.url;

      // LOCAL (testing)
      const filename = `${Date.now()}-${thumbnailFile.name || 'thumb.jpg'}`;
      external.thumbnail = uploadToLocal(buffer, "product/external", filename);
    }

    await external.save();

    return new ApiResponse(200, external, 'External updated successfully');
  });
}

// ─── Delete External ───────────────────────────────────────────────────────────
export async function deleteExternalController(request, { params }) {
  return handleRequest(async () => {
    const { id } = await params;
    const external = await External.findByIdAndDelete(id);

    if (!external) {
      throw new ApiError(404, 'External not found');
    }

    // CLOUDINARY (production)
    // Optional: Delete images from Cloudinary here. 

    // LOCAL (testing)
    if (external.thumbnail) {
      const filePath = path.join(process.cwd(), "public", external.thumbnail);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    return new ApiResponse(200, null, 'External deleted successfully');
  });
}
