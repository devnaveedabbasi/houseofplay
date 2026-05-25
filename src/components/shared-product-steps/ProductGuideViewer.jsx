"use client";

import { useState } from "react";
import { X, Info } from "lucide-react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { createPortal } from "react-dom";

export default function ProductGuideViewer({ productType }) {
  const [lightboxImg, setLightboxImg] = useState(null);

  const { rawGuideImages, madeGuideImages } = useSelector(
    (state) => state.platformSettings || { rawGuideImages: [], madeGuideImages: [] }
  );

  let guideImages = [];
  let guideTitle = "Guide";

  if (productType === "raw") {
    guideImages = rawGuideImages;
    guideTitle = "Raw Material Guide";
  } else if (productType === "theme" || productType === "made" || productType === "external") {
    guideImages = madeGuideImages;
    guideTitle = "Made / Theme Guide";
  } else {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-semibold text-gray-800">{guideTitle}</h3>
        <Info size={14} className="text-gray-400" />
      </div>
      <p className="text-xs text-gray-500 mb-4">Reference images for this product type</p>

      {guideImages?.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No guide images available</p>
      ) : (
        <div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {guideImages.map((url, idx) => (
              <Image
                key={idx}
                src={url}
                width={80}
                height={80}
                alt={`Guide ${idx + 1}`}
                className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 border border-gray-200"
                onClick={() => setLightboxImg(url)}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {guideImages.length} guide images available
          </p>
        </div>
      )}

      {/* Lightbox Modal (Portal) */}
      {lightboxImg && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-10 right-4 z-[10000] bg-black text-white rounded-full p-3 shadow-lg hover:bg-gray-800 transition-colors"
          >
            <X size={28} />
          </button>
          <div className="relative flex items-center justify-center w-full h-full max-w-5xl">
            <Image
              src={lightboxImg}
              alt="Guide Image Fullscreen"
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              priority
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
