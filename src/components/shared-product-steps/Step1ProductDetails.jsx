"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import * as yup from "yup";
import StepWrapper from "@/components/ui/StepWrapper";

// Shared field styles
const inputCls = `
  w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-gray-800
  placeholder:text-gray-400 outline-none transition-all duration-200 bg-white
  focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20
`;
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";
const errorCls = "text-xs text-red-500 mt-1";

function FieldLabel({ children, required, optional }) {
  return (
    <label className={labelCls}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
      {optional && <span className="text-xs text-gray-400 font-normal ml-1">(Optional)</span>}
    </label>
  );
}

const step1Schema = yup.object().shape({
  productName: yup.string().trim().required("Product Name is required."),
  denominationPackSize: yup
    .number()
    .typeError("Must be a valid number.")
    .required("Denomination / Pack Size is required."),
});

export default function Step1ProductDetails({ data, onChange, onNext, productType = "raw" }) {
  const [errors, setErrors] = useState({});
  const thumbRef = useRef(null);

  const labels = {
    raw: { title: "Add Raw Material", placeholder: "Describe the raw material, its properties, usage..." },
    theme: { title: "Add Theme", placeholder: "Describe the theme, its style, components..." },
    external: { title: "Add External Product", placeholder: "Describe the external product..." },
  };

  const currentLabels = labels[productType] || labels.raw;

  const validate = async () => {
    try {
      await step1Schema.validate(data, { abortEarly: false });
      return {};
    } catch (err) {
      const e = {};
      if (err.inner) {
        err.inner.forEach((error) => {
          if (!e[error.path]) e[error.path] = error.message;
        });
      }
      return e;
    }
  };

  const handleNext = async () => {
    const e = await validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    onNext();
  };

  const set = (field, value) => {
    onChange({ [field]: value });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // BUG 3 FIX: thumbnail handler
  const handleThumbChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { onChange({ thumbnail: file }); }
    e.target.value = "";
  };
  const removeThumb = () => onChange({ thumbnail: null });

  const charCount = (data.description || "").length;
  const thumbUrl = data.thumbnail ? URL.createObjectURL(data.thumbnail) : null;

  return (
    <StepWrapper
      stepNumber={1}
      title={currentLabels.title}
      subtitle="Product Details"
      onNext={handleNext}
      nextLabel="Next Step"
    >
      {/* Product Name */}
      <div>
        <FieldLabel required>Product Name</FieldLabel>
        <input
          type="text"
          placeholder="e.g. Steel Rod 10mm"
          value={data.productName || ""}
          onChange={(e) => set("productName", e.target.value)}
          className={`${inputCls} ${errors.productName ? "border-red-400 bg-red-50/30" : ""}`}
        />
        {errors.productName && <p className={errorCls}>{errors.productName}</p>}
      </div>

      {/* Standard Toggle */}
<div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
  <div>
    <FieldLabel required>Standard</FieldLabel>
    <p className="text-xs text-gray-400 -mt-1">
      Is this a standard?
    </p>
  </div>

  <div className="flex items-center gap-3">
    
    {/* YES / NO TEXT */}
    <span
      className={`text-sm font-medium transition-colors ${
        data.standard ? "text-secondary-500" : "text-gray-400"
      }`}
    >
      {data.standard ? "Yes" : "No"}
    </span>

    {/* TOGGLE */}
    <button
      type="button"
      onClick={() => set("standard", !data.standard)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        data.standard ? "bg-secondary-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          data.standard ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>

  </div>
</div>
      {errors.standard && <p className={errorCls}>{errors.standard}</p>}
      {/* BUG 3 FIX: Product Thumbnail upload — after Standard, before Description */}


      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <label className={labelCls.replace("mb-1.5", "")}>Description</label>
            <span className="text-xs text-gray-400 font-normal">(Optional)</span>
          </div>
          <span
            className={`text-xs font-medium ${
              charCount > 950 ? "text-red-500" : charCount > 800 ? "text-amber-500" : "text-gray-400"
            }`}
          >
            {charCount} / 1000
          </span>
        </div>
        <textarea
          maxLength={1000}
          placeholder={currentLabels.placeholder}
          value={data.description || ""}
          onChange={(e) => set("description", e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-800 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 bg-white focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 resize-none min-h-[100px]"
          style={{ lineHeight: "1.6" }}
        />
      </div>

      {/* Denomination / Pack Size */}
      <div>
        <FieldLabel required>Denomination / Pack Size</FieldLabel>
        <input
          type="number"
          placeholder="e.g. 100"
          value={data.denominationPackSize ?? ""}
          onChange={(e) => set("denominationPackSize", e.target.value)}
          className={`${inputCls} ${errors.denominationPackSize ? "border-red-400 bg-red-50/30" : ""}`}
        />
        {errors.denominationPackSize && <p className={errorCls}>{errors.denominationPackSize}</p>}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <label className={labelCls.replace("mb-1.5", "")}>Product Thumbnail</label>
          <span className="text-xs text-gray-400 font-normal">(Optional)</span>
        </div>

        {!thumbUrl ? (
          /* Upload zone */
          <button
            type="button"
            onClick={() => thumbRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-secondary-50 hover:border-secondary-500/50 transition-all group flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-secondary-500/40 transition-colors">
              <Upload size={18} className="text-gray-400 group-hover:text-secondary-500 transition-colors" />
            </div>
            <span className="text-sm font-medium text-gray-500 group-hover:text-secondary-500 transition-colors">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
          </button>
        ) : (
          /* Preview */
          <div className="flex items-center gap-4">
            <div className="relative w-[120px] h-[120px] rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
              <img src={thumbUrl} alt="thumbnail" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeThumb}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
              >
                <X size={12} color="white" strokeWidth={3} />
              </button>
            </div>
            <div className="text-sm text-gray-500">
              <p className="font-medium text-gray-700 truncate max-w-[160px]">
                {data.thumbnail?.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {data.thumbnail ? (data.thumbnail.size / 1024).toFixed(1) + " KB" : ""}
              </p>
              <button
                type="button"
                onClick={() => thumbRef.current?.click()}
                className="text-xs mt-2 font-medium underline underline-offset-2 text-secondary-500"
              >
                Change image
              </button>
            </div>
          </div>
        )}

        <input
          ref={thumbRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleThumbChange}
        />
      </div>

    </StepWrapper>
  );
}
