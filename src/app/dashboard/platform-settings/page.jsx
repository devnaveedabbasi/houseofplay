"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSettings,
  uploadRawGuideImages,
  deleteRawGuideImage,
  uploadMadeGuideImages,
  deleteMadeGuideImage,
} from "@/store/platformSettingsSlice";

export default function PlatformSettingsPage() {
  const dispatch = useDispatch();
  const { rawGuideImages, madeGuideImages, loading, uploading } = useSelector(
    (state) => state.platformSettings
  );

  const rawInputRef = useRef(null);
  const madeInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const handleRawUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (rawGuideImages.length + files.length > 5) {
      toast.error("You can only upload up to 5 images total");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("rawGuideImages", file));

    await dispatch(uploadRawGuideImages(formData));
    dispatch(fetchSettings());
    e.target.value = "";
  };

  const handleMadeUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (madeGuideImages.length + files.length > 5) {
      toast.error("You can only upload up to 5 images total");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("madeGuideImages", file));

    await dispatch(uploadMadeGuideImages(formData));
    dispatch(fetchSettings());
    e.target.value = "";
  };

  const confirmAndDelete = (filename, type) => {
    if (confirm("Are you sure you want to delete this image?")) {
      if (type === "raw") {
        dispatch(deleteRawGuideImage(filename));
      } else {
        dispatch(deleteMadeGuideImage(filename));
      }
    }
  };

  const extractFilename = (url) => url.split("/").pop();

  if (loading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 pt-8 space-y-6">
        <div className="h-8 bg-gray-200 rounded-lg w-1/4 animate-pulse"></div>
        <div className="flex gap-6">
          <div className="h-[400px] bg-gray-200 rounded-2xl w-1/2 animate-pulse"></div>
          <div className="h-[400px] bg-gray-200 rounded-2xl w-1/2 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pb-10 space-y-5">
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-semibold text-primary-600">
              Platform Settings
            </h1>
            <p className="text-sm mt-0.5 text-primary-400">
              Manage platform-wide configurations and guides
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Raw Material Guide Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Raw Material Guide
                </h2>
                <p className="text-sm text-gray-500">
                  Upload guide images for this product type
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-md ${
                  rawGuideImages.length < 5
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {rawGuideImages.length} / 5 images
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {rawGuideImages.map((url) => {
                const filename = extractFilename(url);
                return (
                  <div
                    key={filename}
                    className="relative w-full aspect-square rounded-lg border border-gray-200 overflow-hidden group"
                  >
                    <img
                      src={url}
                      alt="Guide"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => confirmAndDelete(filename, "raw")}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon icon="solar:close-circle-bold" className="text-lg" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto">
              {rawGuideImages.length < 5 ? (
                <div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={rawInputRef}
                    className="hidden"
                    onChange={handleRawUpload}
                  />
                  <button
                    disabled={uploading}
                    onClick={() => rawInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-primary-50/50 hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <Icon
                        icon="solar:spinner-bold"
                        className="text-2xl text-primary-400 animate-spin"
                      />
                    ) : (
                      <Icon
                        icon="solar:upload-minimalistic-bold"
                        className="text-2xl text-gray-400 group-hover:text-primary-500 transition-colors"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">
                      {uploading ? "Uploading..." : "Click to select images"}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
                  <p className="text-sm text-gray-500">
                    Maximum 5 images uploaded. Delete an image to upload a new one.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Made Guide Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Made Guide
                </h2>
                <p className="text-sm text-gray-500">
                  Upload guide images for this product type
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-md ${
                  madeGuideImages.length < 5
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {madeGuideImages.length} / 5 images
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {madeGuideImages.map((url) => {
                const filename = extractFilename(url);
                return (
                  <div
                    key={filename}
                    className="relative w-full aspect-square rounded-lg border border-gray-200 overflow-hidden group"
                  >
                    <img
                      src={url}
                      alt="Guide"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => confirmAndDelete(filename, "made")}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon icon="solar:close-circle-bold" className="text-lg" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto">
              {madeGuideImages.length < 5 ? (
                <div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={madeInputRef}
                    className="hidden"
                    onChange={handleMadeUpload}
                  />
                  <button
                    disabled={uploading}
                    onClick={() => madeInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-primary-50/50 hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <Icon
                        icon="solar:spinner-bold"
                        className="text-2xl text-primary-400 animate-spin"
                      />
                    ) : (
                      <Icon
                        icon="solar:upload-minimalistic-bold"
                        className="text-2xl text-gray-400 group-hover:text-primary-500 transition-colors"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">
                      {uploading ? "Uploading..." : "Click to select images"}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
                  <p className="text-sm text-gray-500">
                    Maximum 5 images uploaded. Delete an image to upload a new one.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
