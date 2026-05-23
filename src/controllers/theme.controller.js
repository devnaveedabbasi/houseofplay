import { NextResponse } from 'next/server';
import Theme from '@/models/theme.model';
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

// ─── Create Theme ──────────────────────────────────────────────────────────────
export async function createThemeController(request, { user }) {
  return handleRequest(async () => {
    const formData = await request.formData();

    // Text fields
    const productName = formData.get('productName');
    const standard = formData.get('standard') === 'true';
    const description = formData.get('description');
    const denominationPackSize = Number(formData.get('denominationPackSize'));
    const themePrice = Number(formData.get('themePrice'));
    const supplier = formData.get('supplier');
    const supplierSKU = formData.get('supplierSKU');
    const sku = formData.get('sku');

    const measurementsRaw = formData.get('measurements');
    let measurements = {};
    if (measurementsRaw) {
      measurements = JSON.parse(measurementsRaw);
    }

    if (!productName || isNaN(denominationPackSize) || isNaN(themePrice)) {
      throw new ApiError(400, 'productName, denominationPackSize, and themePrice are required.');
    }

    // Handle single file
    const thumbnailFile = formData.get('thumbnail');
    let thumbnailUrl = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      const buffer = await fileToBuffer(thumbnailFile);
      // CLOUDINARY (production)
      // const result = await uploadToCloudinary(buffer, 'themes/thumbnails');
      // thumbnailUrl = result.url;

      // LOCAL (testing)
      const filename = `${Date.now()}-${thumbnailFile.name || 'thumb.jpg'}`;
      thumbnailUrl = uploadToLocal(buffer, "product/theme", filename);
    }

    // Create theme
    const theme = await Theme.create({
      productName,
      standard,
      description,
      denominationPackSize,
      thumbnail: thumbnailUrl,
      measurements,
      supplier, // assuming it's an ObjectId string
      themePrice,
      supplierSKU,
      sku,
      createdBy: user?.userId,
    });

    return new ApiResponse(201, theme, 'Theme added successfully');
  });
}

// ─── Get All Themes ────────────────────────────────────────────────────────────
export async function getAllThemesController(request) {
  return handleRequest(async () => {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const themes = await Theme.find()
      .populate('supplier', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Theme.countDocuments();
    const pages = Math.ceil(total / limit);

    return new ApiResponse(200, {
      themes,
      total,
      page,
      pages,
    }, 'Themes fetched successfully');
  });
}

// ─── Get Theme By ID ───────────────────────────────────────────────────────────
export async function getThemeByIdController(request, { params }) {
  return handleRequest(async () => {
    const { id } = await params;
    const theme = await Theme.findById(id).populate('supplier', 'name');

    if (!theme) {
      throw new ApiError(404, 'Theme not found');
    }

    return new ApiResponse(200, theme, 'Theme fetched successfully');
  });
}

// ─── Update Theme ──────────────────────────────────────────────────────────────
export async function updateThemeController(request, { params }) {
  return handleRequest(async () => {
    const { id } = await params;
    const theme = await Theme.findById(id);

    if (!theme) {
      throw new ApiError(404, 'Theme not found');
    }

    const formData = await request.formData();

    // Basic text fields update
    if (formData.has('productName')) theme.productName = formData.get('productName');
    if (formData.has('standard')) theme.standard = formData.get('standard') === 'true';
    if (formData.has('description')) theme.description = formData.get('description');
    if (formData.has('denominationPackSize')) theme.denominationPackSize = Number(formData.get('denominationPackSize'));
    if (formData.has('themePrice')) theme.themePrice = Number(formData.get('themePrice'));
    if (formData.has('supplier')) theme.supplier = formData.get('supplier');
    if (formData.has('supplierSKU')) theme.supplierSKU = formData.get('supplierSKU');
    if (formData.has('sku')) theme.sku = formData.get('sku');

    if (formData.has('measurements')) {
      theme.measurements = JSON.parse(formData.get('measurements'));
    }

    // Handle files
    const thumbnailFile = formData.get('thumbnail');
    if (thumbnailFile && thumbnailFile.size > 0) {
      const buffer = await fileToBuffer(thumbnailFile);
      // CLOUDINARY (production)
      // const result = await uploadToCloudinary(buffer, 'themes/thumbnails');
      // theme.thumbnail = result.url;

      // LOCAL (testing)
      const filename = `${Date.now()}-${thumbnailFile.name || 'thumb.jpg'}`;
      theme.thumbnail = uploadToLocal(buffer, "product/theme", filename);
    }

    await theme.save();

    return new ApiResponse(200, theme, 'Theme updated successfully');
  });
}

// ─── Delete Theme ──────────────────────────────────────────────────────────────
export async function deleteThemeController(request, { params }) {
  return handleRequest(async () => {
    const { id } = await params;
    const theme = await Theme.findByIdAndDelete(id);

    if (!theme) {
      throw new ApiError(404, 'Theme not found');
    }

    // CLOUDINARY (production)
    // Optional: Delete images from Cloudinary here. 

    // LOCAL (testing)
    if (theme.thumbnail) {
      const filePath = path.join(process.cwd(), "public", theme.thumbnail);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    return new ApiResponse(200, null, 'Theme deleted successfully');
  });
}
