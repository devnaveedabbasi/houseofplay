import { NextResponse } from 'next/server';
import RawMaterial from '@/models/rawMaterial.model';
import Supplier from '@/models/supplier.model';
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

// ─── Create Raw Material ───────────────────────────────────────────────────────
export async function createRawMaterialController(request, { user }) {
  return handleRequest(async () => {
    const formData = await request.formData();

    // Text fields
    const productName = formData.get('productName');
    const standard = formData.get('standard') === 'true';
    const description = formData.get('description');
    const denominationPackSize = Number(formData.get('denominationPackSize'));
    const rawMaterialPrice = Number(formData.get('rawMaterialPrice'));
    const supplier = formData.get('supplier');
    const supplierSKU = formData.get('supplierSKU');
    const sku = formData.get('sku');

    const measurementsRaw = formData.get('measurements');
    let measurements = {};
    if (measurementsRaw) {
      measurements = JSON.parse(measurementsRaw);
    }

    if (!productName || isNaN(denominationPackSize) || isNaN(rawMaterialPrice)) {
      throw new ApiError(400, 'productName, denominationPackSize, and rawMaterialPrice are required.');
    }

    // Handle files
    const thumbnailFile = formData.get('thumbnail');
    let thumbnailUrl = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      const buffer = await fileToBuffer(thumbnailFile);
      // CLOUDINARY (production)
      // const result = await uploadToCloudinary(buffer, 'raw-materials/thumbnails');
      // thumbnailUrl = result.url;

      // LOCAL (testing)
      const filename = `${Date.now()}-${thumbnailFile.name || 'thumb.jpg'}`;
      thumbnailUrl = uploadToLocal(buffer, "product/raw", filename);
    }

    const imageFiles = formData.getAll('images');
    const imageUrls = [];
    if (imageFiles.length > 5) {
      throw new ApiError(400, 'Maximum of 5 images allowed.');
    }

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const buffer = await fileToBuffer(file);
        // CLOUDINARY (production)
        // const result = await uploadToCloudinary(buffer, 'raw-materials/images');
        // imageUrls.push(result.url);

        // LOCAL (testing)
        const filename = `${Date.now()}-${file.name || 'image.jpg'}`;
        const localUrl = uploadToLocal(buffer, "product/raw", filename);
        imageUrls.push(localUrl);
      }
    }

    // Create raw material
    const rawMaterial = await RawMaterial.create({
      productName,
      standard,
      description,
      denominationPackSize,
      thumbnail: thumbnailUrl,
      measurements,
      images: imageUrls,
      supplier, // assuming it's an ObjectId string
      rawMaterialPrice,
      supplierSKU,
      sku,
      createdBy: user?.userId,
    });

    return new ApiResponse(201, rawMaterial, 'Raw material added successfully');
  });
}

// ─── Get All Raw Materials ─────────────────────────────────────────────────────
export async function getAllRawMaterialsController(request) {
  return handleRequest(async () => {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const rawMaterials = await RawMaterial.find()
      .populate('supplier', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await RawMaterial.countDocuments();
    const pages = Math.ceil(total / limit);

    return new ApiResponse(200, {
      rawMaterials,
      total,
      page,
      pages,
    }, 'Raw materials fetched successfully');
  });
}

// ─── Get Raw Material By ID ────────────────────────────────────────────────────
export async function getRawMaterialByIdController(request, { params }) {
  return handleRequest(async () => {
    // Note: params comes from the Next.js route handler parameter
    // We expect params.id to be available. Since handleRequest abstracts this slightly,
    // we should extract id directly. Wait, handleRequest is a wrapper. Let's pass params.id directly if needed.
    // Actually, params.id is just params.id.
    const { id } = await params;
    const rawMaterial = await RawMaterial.findById(id).populate('supplier', 'name');

    if (!rawMaterial) {
      throw new ApiError(404, 'Raw material not found');
    }

    return new ApiResponse(200, rawMaterial, 'Raw material fetched successfully');
  });
}

// ─── Update Raw Material ───────────────────────────────────────────────────────
export async function updateRawMaterialController(request, { params }) {
  return handleRequest(async () => {
    const { id } = await params;
    const rawMaterial = await RawMaterial.findById(id);

    if (!rawMaterial) {
      throw new ApiError(404, 'Raw material not found');
    }

    const formData = await request.formData();

    // Basic text fields update
    if (formData.has('productName')) rawMaterial.productName = formData.get('productName');
    if (formData.has('standard')) rawMaterial.standard = formData.get('standard') === 'true';
    if (formData.has('description')) rawMaterial.description = formData.get('description');
    if (formData.has('denominationPackSize')) rawMaterial.denominationPackSize = Number(formData.get('denominationPackSize'));
    if (formData.has('rawMaterialPrice')) rawMaterial.rawMaterialPrice = Number(formData.get('rawMaterialPrice'));
    if (formData.has('supplier')) rawMaterial.supplier = formData.get('supplier');
    if (formData.has('supplierSKU')) rawMaterial.supplierSKU = formData.get('supplierSKU');

    if (formData.has('measurements')) {
      rawMaterial.measurements = JSON.parse(formData.get('measurements'));
    }

    // Handle files
    const thumbnailFile = formData.get('thumbnail');
    if (thumbnailFile && thumbnailFile.size > 0) {
      const buffer = await fileToBuffer(thumbnailFile);
      // CLOUDINARY (production)
      // const result = await uploadToCloudinary(buffer, 'raw-materials/thumbnails');
      // rawMaterial.thumbnail = result.url;

      // LOCAL (testing)
      const filename = `${Date.now()}-${thumbnailFile.name || 'thumb.jpg'}`;
      rawMaterial.thumbnail = uploadToLocal(buffer, "product/raw", filename);
    }

    const imageFiles = formData.getAll('images');
    if (imageFiles.length > 0) {
      const imageUrls = [];
      for (const file of imageFiles) {
        if (file && file.size > 0) {
          const buffer = await fileToBuffer(file);
          // CLOUDINARY (production)
          // const result = await uploadToCloudinary(buffer, 'raw-materials/images');
          // imageUrls.push(result.url);

          // LOCAL (testing)
          const filename = `${Date.now()}-${file.name || 'image.jpg'}`;
          const localUrl = uploadToLocal(buffer, "product/raw", filename);
          imageUrls.push(localUrl);
        }
      }
      if (imageUrls.length > 0) {
        rawMaterial.images = imageUrls;
      }
    }

    await rawMaterial.save();

    return new ApiResponse(200, rawMaterial, 'Raw material updated successfully');
  });
}

// ─── Delete Raw Material ───────────────────────────────────────────────────────
export async function deleteRawMaterialController(request, { params }) {
  return handleRequest(async () => {
    const { id } = await params;
    const rawMaterial = await RawMaterial.findByIdAndDelete(id);

    if (!rawMaterial) {
      throw new ApiError(404, 'Raw material not found');
    }

    // CLOUDINARY (production)
    // Optional: Delete images from Cloudinary here. 
    // Usually requires extracting public_id from the URL.

    // LOCAL (testing)
    if (rawMaterial.thumbnail) {
      const filePath = path.join(process.cwd(), "public", rawMaterial.thumbnail);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    if (rawMaterial.images && rawMaterial.images.length > 0) {
      rawMaterial.images.forEach(imgUrl => {
        const filePath = path.join(process.cwd(), "public", imgUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    return new ApiResponse(200, null, 'Raw material deleted successfully');
  });
}
