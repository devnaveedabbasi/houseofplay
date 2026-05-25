import { NextResponse } from 'next/server';
import PlatformSettings from '@/models/platformSettings.model';
import { ApiError } from '@/utils/ApiError';
import { ApiResponse } from '@/utils/ApiResponse';
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

// ─── Get Settings ──────────────────────────────────────────────────────────────
export async function getSettingsController(request) {
  return handleRequest(async () => {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({
        rawMaterialGuide: { images: [] },
        madeGuide: { images: [] },
      });
    }
    return new ApiResponse(200, settings, 'Settings fetched successfully');
  });
}

// ─── Upload Raw Guide Images ───────────────────────────────────────────────────
export async function uploadRawGuideImagesController(request, { user }) {
  return handleRequest(async () => {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = new PlatformSettings({ rawMaterialGuide: { images: [] }, madeGuide: { images: [] } });
    }

    const formData = await request.formData();
    const imageFiles = formData.getAll('rawGuideImages');

    if (imageFiles.length === 0) {
      throw new ApiError(400, 'No images provided');
    }

    const currentCount = settings.rawMaterialGuide?.images?.length || 0;
    if (currentCount + imageFiles.length > 5) {
      throw new ApiError(400, 'Maximum 5 images allowed');
    }

    const newUrls = [];
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const buffer = await fileToBuffer(file);
        const filename = `${Date.now()}-${file.name || 'image.jpg'}`;
        const localUrl = uploadToLocal(buffer, 'guides/raw', filename);
        newUrls.push(localUrl);
      }
    }

    if (!settings.rawMaterialGuide) settings.rawMaterialGuide = { images: [] };
    settings.rawMaterialGuide.images.push(...newUrls);
    if (user?.userId) settings.updatedBy = user.userId;

    await settings.save();

    return new ApiResponse(200, settings, 'Images uploaded successfully');
  });
}

// ─── Delete Raw Guide Image ────────────────────────────────────────────────────
export async function deleteRawGuideImageController(request) {
  return handleRequest(async () => {
    const url = new URL(request.url);
    const filename = decodeURIComponent(url.pathname.split('/').pop());

    
    let settings = await PlatformSettings.findOne();
    if (!settings || !settings.rawMaterialGuide) {
      throw new ApiError(404, 'Settings not found');
    }

    const targetUrl = `/uploads/guides/raw/${filename}`;
    const imageIndex = settings.rawMaterialGuide.images.indexOf(targetUrl);
    
    if (imageIndex === -1) {
      throw new ApiError(404, 'Image not found in settings');
    }

    settings.rawMaterialGuide.images.splice(imageIndex, 1);
    await settings.save();

    const filePath = path.join(process.cwd(), 'public', targetUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return new ApiResponse(200, null, 'Image deleted');
  });
}

// ─── Upload Made Guide Images ──────────────────────────────────────────────────
export async function uploadMadeGuideImagesController(request, { user }) {
  return handleRequest(async () => {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = new PlatformSettings({ rawMaterialGuide: { images: [] }, madeGuide: { images: [] } });
    }

    const formData = await request.formData();
    const imageFiles = formData.getAll('madeGuideImages');

    if (imageFiles.length === 0) {
      throw new ApiError(400, 'No images provided');
    }

    const currentCount = settings.madeGuide?.images?.length || 0;
    if (currentCount + imageFiles.length > 5) {
      throw new ApiError(400, 'Maximum 5 images allowed');
    }

    const newUrls = [];
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const buffer = await fileToBuffer(file);
        const filename = `${Date.now()}-${file.name || 'image.jpg'}`;
        const localUrl = uploadToLocal(buffer, 'guides/made', filename);
        newUrls.push(localUrl);
      }
    }

    if (!settings.madeGuide) settings.madeGuide = { images: [] };
    settings.madeGuide.images.push(...newUrls);
    if (user?.userId) settings.updatedBy = user.userId;

    await settings.save();

    return new ApiResponse(200, settings, 'Images uploaded successfully');
  });
}

// ─── Delete Made Guide Image ───────────────────────────────────────────────────
export async function deleteMadeGuideImageController(request) {
  return handleRequest(async () => {
    const url = new URL(request.url);
    const filename = decodeURIComponent(url.pathname.split('/').pop());

    
    let settings = await PlatformSettings.findOne();
    if (!settings || !settings.madeGuide) {
      throw new ApiError(404, 'Settings not found');
    }

    const targetUrl = `/uploads/guides/made/${filename}`;
    const imageIndex = settings.madeGuide.images.indexOf(targetUrl);
    
    if (imageIndex === -1) {
      throw new ApiError(404, 'Image not found in settings');
    }

    settings.madeGuide.images.splice(imageIndex, 1);
    await settings.save();

    const filePath = path.join(process.cwd(), 'public', targetUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return new ApiResponse(200, null, 'Image deleted');
  });
}
