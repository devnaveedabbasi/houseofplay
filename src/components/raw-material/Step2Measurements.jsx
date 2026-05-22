"use client";

import { useRef, useState } from "react";
import { Upload, X, Plus } from "lucide-react";
import StepWrapper from "@/components/ui/StepWrapper";

const inputCls = `
  w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-gray-800
  placeholder:text-gray-400 outline-none transition-all duration-200 bg-white
  focus:border-[#4CA048] focus:ring-2 focus:ring-[#4CA048]/20
`;
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";
const errorCls = "text-xs text-red-500 mt-1";

function Field({ label, required, optional, error, children }) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {optional && <span className="text-xs text-gray-400 font-normal ml-1">(Optional)</span>}
      </label>
      {children}
      {error && <p className={errorCls}>{error}</p>}
    </div>
  );
}

export default function Step2Measurements({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!data.lengthMM && data.lengthMM !== 0) e.lengthMM = "Length MM is required.";
    if (!data.widthMM && data.widthMM !== 0) e.widthMM = "Width MM is required.";
    if (!data.heightMM && data.heightMM !== 0) e.heightMM = "Height MM is required.";
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    onNext();
  };

  const set = (field, value) => {
    onChange({ [field]: value });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const existing = data.images || [];
    const combined = [...existing, ...files].slice(0, 5);
    onChange({ images: combined });
    e.target.value = "";
  };

  const removeImage = (index) => {
    const updated = (data.images || []).filter((_, i) => i !== index);
    onChange({ images: updated });
  };

  const images = data.images || [];
  const remaining = 5 - images.length;

  return (
    <StepWrapper
      stepNumber={2}
      title="Product Information"
      subtitle="Measurements"
      onNext={handleNext}
      onBack={onBack}
      nextLabel="Next Step"
    >
      {/* Dimensions — 2 column grid */}
      <div className="grid grid-cols-3 items-center gap-4">
        <Field label="Length MM" required error={errors.lengthMM}>
          <input type="number" placeholder="0"
            value={data.lengthMM ?? ""} onChange={(e) => set("lengthMM", e.target.value)}
            className={`${inputCls} ${errors.lengthMM ? "border-red-400 bg-red-50/30" : ""}`} />
        </Field>

        <Field label="Width MM" required error={errors.widthMM}>
          <input type="number" placeholder="0"
            value={data.widthMM ?? ""} onChange={(e) => set("widthMM", e.target.value)}
            className={`${inputCls} ${errors.widthMM ? "border-red-400 bg-red-50/30" : ""}`} />
        </Field>

        <Field label="Height MM" required error={errors.heightMM}>
          <input type="number" placeholder="0"
            value={data.heightMM ?? ""} onChange={(e) => set("heightMM", e.target.value)}
            className={`${inputCls} ${errors.heightMM ? "border-red-400 bg-red-50/30" : ""}`} />
        </Field>



      </div>

      <div className="grid grid-cols-2 items-center gap-4">

        <Field label="Installation Time (MINS)" optional>
          <input type="number" placeholder="0"
            value={data.installationTimeMins ?? ""} onChange={(e) => set("installationTimeMins", e.target.value)}
            className={inputCls} />
        </Field>

        <Field label="Weight (KGS)" optional>
          <input type="number" placeholder="0"
            value={data.weightKgs ?? ""} onChange={(e) => set("weightKgs", e.target.value)}
            className={inputCls} />
        </Field>
      </div>

      {/* Section divider */}
      <div className="relative flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Product Images</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Image Upload */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls.replace(" mb-1.5", "")}>
            Upload Images
            <span className="text-xs text-gray-400 font-normal ml-1">(Optional, max 5)</span>
          </label>
          <span className="text-xs text-gray-400">{images.length} / 5 uploaded</span>
        </div>

        {/* Upload zone — shown when slots remain */}
        {images.length === 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-green-50/50 hover:border-[#4CA048]/50 transition-all group flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-[#4CA048]/40 transition-colors">
              <Upload size={18} className="text-gray-400 group-hover:text-[#4CA048] transition-colors" />
            </div>
            <span className="text-sm font-medium text-gray-500 group-hover:text-[#4CA048] transition-colors">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
          </button>
        )}

        {/* Thumbnail grid with add-more slots */}
        {images.length > 0 && (
          <div className="grid grid-cols-5 gap-3">
            {/* Existing images */}
            {images.map((file, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`upload-${i}`}
                  className="w-full h-45 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <X size={12} color="white" strokeWidth={3} />
                </button>
              </div>
            ))}

            {/* Remaining add-more slots */}
            {remaining > 0 && images.length > 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-[#4CA048]/50 hover:bg-green-50/40 transition-all group"
              >
                <Plus size={20} className="text-gray-300 group-hover:text-[#4CA048] transition-colors" />
                <span className="text-xs text-gray-400 group-hover:text-[#4CA048] transition-colors">
                  Add
                </span>
              </button>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </StepWrapper>
  );
}
