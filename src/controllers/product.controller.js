import { NextResponse } from 'next/server';
import { Product } from '@/models/product.model';
import Counter from '@/models/counter.model';
import { ApiError } from '@/utils/ApiError';
import { ApiResponse } from '@/utils/ApiResponse';
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
    // Duplicate key error (e.g., SKU)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, statusCode: 400, message: 'SKU must be unique.' },
        { status: 400 }
      );
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

// ─── Controller Functions ──────────────────────────────────────────────────────

export async function createProductController(request, { user }) {
  return handleRequest(async () => {
    const formData = await request.formData();
    
    const productType = formData.get('productType');
    if (!['raw', 'theme', 'external'].includes(productType)) {
      throw new ApiError(400, 'Invalid or missing productType');
    }

    const payload = {
      productType,
      sku: formData.get('sku'),
      productName: formData.get('productName'),
      standard: formData.get('standard') === 'true',
      description: formData.get('description'),
      denominationPackSize: Number(formData.get('denominationPackSize')),
      supplier: formData.get('supplier') || null,
      supplierName: formData.get('supplierName'),
      supplierSKU: formData.get('supplierSKU'),
      createdBy: user.userId,
    };

    // Auto-increment productCode securely
    let counter = await Counter.findOneAndUpdate(
      { id: 'productCode' },
      { $inc: { seq: 1 } },
      { new: true }
    );
    if (!counter) {
      counter = await Counter.create({ id: 'productCode', seq: 15000 });
    }
    payload.productCode = counter.seq;

    // Measurements
    const measurementsStr = formData.get('measurements');
    if (measurementsStr) {
      payload.measurements = JSON.parse(measurementsStr);
    }

    // Type-specific Pricing Fields
    if (productType === 'raw') {
      payload.rawMaterialPrice = Number(formData.get('rawMaterialPrice') || 0);
    } else if (productType === 'theme') {
      payload.themePrice = Number(formData.get('themePrice') || 0);
    } else if (productType === 'external') {
      payload.externalPrice = Number(formData.get('externalPrice') || 0);
    }

    // Process single thumbnail image
    const thumbnailFile = formData.get('thumbnail');
    if (thumbnailFile && thumbnailFile.size > 0) {
      const buffer = await fileToBuffer(thumbnailFile);
      const filename = `${Date.now()}-thumb-${thumbnailFile.name || 'image.jpg'}`;
      payload.thumbnail = uploadToLocal(buffer, `products/${productType}`, filename);
    }

    // Process multiple images (Only for Raw Materials currently)
    if (productType === 'raw') {
      const imageFiles = formData.getAll('images');
      if (imageFiles.length > 5) {
        throw new ApiError(400, 'Maximum 5 images allowed');
      }
      
      if (imageFiles.length > 0) {
        const imageUrls = [];
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          if (file.size > 0) {
            const buffer = await fileToBuffer(file);
            const filename = `${Date.now()}-${file.name || 'image.jpg'}`;
            const localUrl = uploadToLocal(buffer, `products/${productType}`, filename);
            imageUrls.push(localUrl);
          }
        }
        payload.images = imageUrls;
      }
    }

    // Product Model naturally uses the correct discriminator via productType
    const product = await Product.create(payload);

    return new ApiResponse(201, product, 'Product created successfully');
  });
}

export async function getProductsController(request) {
  return handleRequest(async () => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    
    // Optional filters
    const typeFilter = url.searchParams.get('type');
    const query = {};
    if (typeFilter && ['raw', 'theme', 'external'].includes(typeFilter)) {
      query.productType = typeFilter;
    }

    // Advanced search / filtering
    const searchName = url.searchParams.get('productName'); // "Product Name / SKU"
    if (searchName) {
      query.$or = [
        { productName: { $regex: searchName, $options: 'i' } },
        { sku: { $regex: searchName, $options: 'i' } }
      ];
    }

    const productCode = url.searchParams.get('productCode');
    if (productCode && !isNaN(productCode)) {
      query.productCode = Number(productCode);
    }

    const status = url.searchParams.get('status');
    if (status) {
      query.status = status;
    }

    const supplier = url.searchParams.get('supplier');
    if (supplier) {
      // Assuming frontend passes supplier ID
      query.supplier = supplier;
    }

    // Sorting
    const sortField = url.searchParams.get('sortField') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const sortConfig = { [sortField]: sortOrder };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('supplier', 'name email phone')
      .populate('createdBy', 'firstName lastName')
      .sort(sortConfig)
      .skip(skip)
      .limit(limit);

    return new ApiResponse(200, {
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    }, 'Products retrieved successfully');
  });
}

export async function getProductByIdController(request) {
  return handleRequest(async () => {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    const product = await Product.findById(id)
      .populate('supplier', 'name email phone')
      .populate('createdBy', 'firstName lastName');

    if (!product) throw new ApiError(404, 'Product not found');

    return new ApiResponse(200, product, 'Product retrieved successfully');
  });
}

export async function updateProductController(request) {
  return handleRequest(async () => {
    // Note: Due to form-data and partial updates, handle accordingly.
    // For now we assume typical payload update or similar approach.
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    // Simplistic approach if formData is used:
    // (Implementation depends on frontend. Keeping it basic as per original controllers)
    const formData = await request.formData();
    const updateData = {};
    
    // Extract standard fields
    for (const [key, value] of formData.entries()) {
      if (key !== 'thumbnail' && key !== 'images' && key !== 'measurements') {
        updateData[key] = value;
      }
    }
    
    // Standard booleans / numbers
    if (updateData.standard) updateData.standard = updateData.standard === 'true';
    if (updateData.denominationPackSize) updateData.denominationPackSize = Number(updateData.denominationPackSize);

    // Measurements
    if (formData.has('measurements')) {
      updateData.measurements = JSON.parse(formData.get('measurements'));
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) throw new ApiError(404, 'Product not found');

    return new ApiResponse(200, product, 'Product updated successfully');
  });
}

export async function deleteProductController(request) {
  return handleRequest(async () => {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw new ApiError(404, 'Product not found');

    return new ApiResponse(200, null, 'Product deleted successfully');
  });
}

export async function bulkUpdateProductStatusController(request) {
  return handleRequest(async () => {
    const body = await request.json();
    const { productIds, status } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new ApiError(400, 'Product IDs array is required');
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }

    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { status } }
    );

    return new ApiResponse(200, { updatedCount: productIds.length }, 'Products updated successfully');
  });
}
