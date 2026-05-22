"use client";

import { CheckCircle, Package, Ruler, Users } from "lucide-react";
import StepWrapper from "@/components/ui/StepWrapper";

// Section configs: title, icon, header colors
const SECTIONS = {
  product: {
    title: "Product Details",
    Icon: Package,
    headerBg: "#f0fdf4",
    headerBorder: "#bbf7d0",
    iconBg: "#dcfce7",
    iconColor: "#16a34a",
  },
  measurements: {
    title: "Measurements",
    Icon: Ruler,
    headerBg: "#eff6ff",
    headerBorder: "#bfdbfe",
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
  },
  supplier: {
    title: "Supplier Information",
    Icon: Users,
    headerBg: "#faf5ff",
    headerBorder: "#e9d5ff",
    iconBg: "#f3e8ff",
    iconColor: "#9333ea",
  },
};

function ReviewSection({ sectionKey, children }) {
  const { title, Icon, headerBg, headerBorder, iconBg, iconColor } = SECTIONS[sectionKey];
  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ borderColor: headerBorder }}
    >
      {/* Colored header */}
      <div
        className="flex items-center gap-2.5 px-5 py-3 border-b"
        style={{ backgroundColor: headerBg, borderColor: headerBorder }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={14} color={iconColor} strokeWidth={2.5} />
        </div>
        <h3 className="text-sm font-bold text-gray-700">{title}</h3>
      </div>
      {/* Content */}
      <div className="bg-white px-5 py-3">{children}</div>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="py-2.5 border-b border-gray-50 last:border-0">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      {value !== null && value !== undefined && value !== "" ? (
        <p className="text-sm font-medium text-gray-800">{String(value)}</p>
      ) : (
        <p className="text-sm text-gray-300 italic">Not provided</p>
      )}
    </div>
  );
}

function DataGrid({ children }) {
  return <div className="grid grid-cols-2 gap-x-6">{children}</div>;
}

export default function Step4ReviewSubmit({ data, suppliers = [], onBack, onSubmit }) {
  const supplierLabel =
    data.supplier
      ? suppliers.find((s) => s.value === data.supplier)?.label || data.supplier
      : "";

  const images = data.images || [];
  const thumbUrl = data.thumbnail ? URL.createObjectURL(data.thumbnail) : null;

  return (
    <StepWrapper
      stepNumber={4}
      title="Review & Submit"
      subtitle="Confirm your details"
      onNext={onSubmit}
      onBack={onBack}
      nextLabel="Submit Raw Material"
      isLastStep
    >
      <div className="space-y-4">

        {/* Product Details */}
        <ReviewSection sectionKey="product">
          {/* Product name + thumbnail row */}
          <div className="flex items-start gap-4 py-2.5 border-b border-gray-50">
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-0.5">Product Name</p>
              <p className="text-sm font-medium text-gray-800">
                {data.productName || <span className="text-gray-300 italic">Not provided</span>}
              </p>
            </div>
            {thumbUrl && (
              <img
                src={thumbUrl}
                alt="thumbnail"
                className="w-20 h-20 rounded-lg object-cover border border-gray-200 flex-shrink-0"
              />
            )}
          </div>

          <DataGrid>
            <DataRow
              label="Standard"
              value={
                data.standard === true
                  ? "✓ Standard"
                  : data.standard === false
                  ? "✕ Non-Standard"
                  : null
              }
            />
            <DataRow label="Pack Size" value={data.denominationPackSize} />
          </DataGrid>

          {data.description && (
            <div className="py-2.5 border-t border-gray-50">
              <p className="text-xs text-gray-400 mb-0.5">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{data.description}</p>
            </div>
          )}
        </ReviewSection>

        {/* Measurements */}
        <ReviewSection sectionKey="measurements">
          <DataGrid>
            <DataRow label="Length" value={data.length} />
            <DataRow label="Length MM" value={data.lengthMM} />
            <DataRow label="Width MM" value={data.widthMM} />
            <DataRow label="Height MM" value={data.heightMM} />
            <DataRow label="Installation Time (MINS)" value={data.installationTimeMins} />
            <DataRow label="Weight (KGS)" value={data.weightKgs} />
          </DataGrid>

          {/* Product images scrollable row */}
          {images.length > 0 && (
            <div className="pt-3 mt-1 border-t border-gray-50">
              <p className="text-xs text-gray-400 mb-2">
                Product Images ({images.length})
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((file, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(file)}
                    alt={`img-${i}`}
                    className="w-[80px] h-[80px] rounded-lg object-cover border border-gray-200 flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          )}
        </ReviewSection>

        {/* Supplier Information */}
        <ReviewSection sectionKey="supplier">
          <DataGrid>
            <DataRow label="Supplier" value={supplierLabel} />
            <DataRow label="Supplier SKU" value={data.supplierSKU} />
            <DataRow
              label="Raw Material Price"
              value={
                data.rawMaterialPrice !== undefined && data.rawMaterialPrice !== ""
                  ? `£ ${Number(data.rawMaterialPrice).toLocaleString()}`
                  : null
              }
            />
          </DataGrid>
        </ReviewSection>

        {/* Info note */}
        <div
          className="flex items-start gap-3 p-4 rounded-xl border"
          style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}
        >
          <CheckCircle size={16} color="#4CA048" className="flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed" style={{ color: "#166534" }}>
            Please review all details carefully. Once submitted, the raw material will be
            added to the system. You can edit it later from the products list.
          </p>
        </div>
      </div>
    </StepWrapper>
  );
}
