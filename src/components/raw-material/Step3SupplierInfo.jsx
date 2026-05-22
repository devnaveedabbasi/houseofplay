"use client";

import { useState } from "react";
import { UserPlus, X, Plus } from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";
import StepWrapper from "@/components/ui/StepWrapper";

const inputCls = `
  w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-gray-800
  placeholder:text-gray-400 outline-none transition-all duration-200 bg-white
  focus:border-[#4CA048] focus:ring-2 focus:ring-[#4CA048]/20
`;
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";
const errorCls = "text-xs text-red-500 mt-1";

const INITIAL_SUPPLIERS = [
  { value: "supplier-1", label: "Acme Steel Supplies" },
  { value: "supplier-2", label: "BuildPro Materials" },
  { value: "supplier-3", label: "Metro Hardware Ltd." },
  { value: "supplier-4", label: "GlobalRaw Co." },
  { value: "supplier-5", label: "Precision Parts Inc." },
];

const ADD_NEW_VALUE = "__add_new__";

export default function Step3SupplierInfo({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({});
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [showNewSupplierInput, setShowNewSupplierInput] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierError, setNewSupplierError] = useState("");

  const validate = () => {
    const e = {};
    if (!data.supplier) e.supplier = "Please select a supplier.";
    if (!data.rawMaterialPrice && data.rawMaterialPrice !== 0)
      e.rawMaterialPrice = "Raw Material Price is required.";
    if (data.rawMaterialPrice !== "" && isNaN(Number(data.rawMaterialPrice)))
      e.rawMaterialPrice = "Must be a valid number.";
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

  const dropdownOptions = [
    ...suppliers,
    { value: ADD_NEW_VALUE, label: "＋  Add New Supplier" },
  ];

  const handleSupplierChange = (val) => {
    if (val === ADD_NEW_VALUE) { setShowNewSupplierInput(true); return; }
    setShowNewSupplierInput(false);
    set("supplier", val);
  };

  const handleAddSupplier = () => {
    const trimmed = newSupplierName.trim();
    if (!trimmed) { setNewSupplierError("Supplier name cannot be empty."); return; }
    const slug = trimmed.toLowerCase().replace(/\s+/g, "-");
    const newEntry = { value: `supplier-custom-${slug}`, label: trimmed };
    setSuppliers((prev) => [...prev, newEntry]);
    set("supplier", newEntry.value);
    setNewSupplierName("");
    setNewSupplierError("");
    setShowNewSupplierInput(false);
  };

  const selectedLabel = suppliers.find((s) => s.value === data.supplier)?.label;

  return (
    <StepWrapper
      stepNumber={3}
      title="Supplier Information"
      subtitle="Procurement Details"
      onNext={handleNext}
      onBack={onBack}
      nextLabel="Next Step"
    >
      {/* Select Supplier */}
      <div>
        <label className={labelCls}>
          Select Supplier <span className="text-red-500">*</span>
        </label>
        <Dropdown
          icon="solar:users-group-rounded-linear"
          placeholder="Choose a supplier..."
          options={dropdownOptions}
          value={data.supplier || ""}
          onChange={handleSupplierChange}
          searchable
        />
        {errors.supplier && <p className={errorCls}>{errors.supplier}</p>}

        {/* Inline new supplier panel */}
        {showNewSupplierInput && (
          <div className="mt-3 p-4 rounded-xl border border-green-100 bg-green-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <UserPlus size={15} style={{ color: "#4CA048" }} />
              <p className="text-sm font-semibold" style={{ color: "#2f7d32" }}>
                Add New Supplier
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter supplier name..."
                  value={newSupplierName}
                  onChange={(e) => { setNewSupplierName(e.target.value); setNewSupplierError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSupplier()}
                  className={`w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 outline-none bg-white focus:border-[#4CA048] focus:ring-2 focus:ring-[#4CA048]/20 ${
                    newSupplierError ? "border-red-400" : ""
                  }`}
                />
                {newSupplierError && <p className={errorCls}>{newSupplierError}</p>}
              </div>
              <button
                type="button"
                onClick={handleAddSupplier}
                className="h-10 px-4 text-white text-sm font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5"
                style={{ backgroundColor: "#4CA048" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3e853b")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4CA048")}
              >
                <Plus size={15} />
                Add
              </button>
              <button
                type="button"
                onClick={() => { setShowNewSupplierInput(false); setNewSupplierName(""); setNewSupplierError(""); }}
                className="h-10 px-3 border border-gray-200 text-gray-400 text-sm rounded-lg hover:border-gray-300 transition-all"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Raw Material Price */}
      <div>
        <label className={labelCls}>
          Raw Material Price <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          placeholder="0.00"
          value={data.rawMaterialPrice ?? ""}
          onChange={(e) => set("rawMaterialPrice", e.target.value)}
          className={`${inputCls} ${errors.rawMaterialPrice ? "border-red-400 bg-red-50/30" : ""}`}
        />
        {errors.rawMaterialPrice && <p className={errorCls}>{errors.rawMaterialPrice}</p>}
      </div>

      {/* Supplier SKU */}
      <div>
        <label className={labelCls}>
          Supplier SKU <span className="text-xs text-gray-400 font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. SKU-10045-B"
          value={data.supplierSKU || ""}
          onChange={(e) => set("supplierSKU", e.target.value)}
          className={inputCls}
        />
      </div>
    </StepWrapper>
  );
}
