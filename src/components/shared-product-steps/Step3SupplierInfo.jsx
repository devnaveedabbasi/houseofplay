"use client";

import { useState } from "react";
import { UserPlus, X, Plus } from "lucide-react";
import * as yup from "yup";
import Dropdown from "@/components/ui/Dropdown";
import StepWrapper from "@/components/ui/StepWrapper";

const inputCls = `
  w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-gray-800
  placeholder:text-gray-400 outline-none transition-all duration-200 bg-white
  focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20
`;
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";
const errorCls = "text-xs text-red-500 mt-1";

const ADD_NEW_VALUE = "__add_new__";

// Schema generation will be dynamic inside component

export default function Step3SupplierInfo({ data, suppliers = [], onChange, onNext, onBack, onCreateSupplier, productType = "raw" }) {
  const [errors, setErrors] = useState({});
  const [showNewSupplierInput, setShowNewSupplierInput] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierError, setNewSupplierError] = useState("");

  const priceField = productType === "theme" ? "themePrice" : productType === "external" ? "externalPrice" : "rawMaterialPrice";
  const priceLabel = productType === "theme" ? "Theme Price" : productType === "external" ? "External Price" : "Raw Material Price";

  const validate = async () => {
    try {
      const dynamicSchema = yup.object().shape({
        supplier: yup.string().required("Please select a supplier."),
        [priceField]: yup
          .number()
          .typeError("Must be a valid number.")
          .min(0, `${priceLabel.replace(' (PKR)', '')} cannot be negative.`)
          .required(`${priceLabel.replace(' (PKR)', '')} is required.`),
      });
      await dynamicSchema.validate(data, { abortEarly: false });
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

  const dropdownOptions = [
    ...suppliers,
    { value: ADD_NEW_VALUE, label: "＋  Add New Supplier" },
  ];

  const handleSupplierChange = (val) => {
    if (val === ADD_NEW_VALUE) { setShowNewSupplierInput(true); return; }
    setShowNewSupplierInput(false);
    set("supplier", val);
  };

  const handleAddSupplier = async () => {
    const trimmed = newSupplierName.trim();
    if (!trimmed) { setNewSupplierError("Supplier name cannot be empty."); return; }
    
    if (onCreateSupplier) {
      await onCreateSupplier(trimmed);
    }
    
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

        {/* New Supplier Form / Trigger */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {!showNewSupplierInput ? (
            <button
              type="button"
              onClick={() => setShowNewSupplierInput(true)}
              className="flex items-center gap-2 px-3 py-2 -ml-3 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <UserPlus size={15} className="text-secondary-500" />
              <p className="text-sm font-semibold text-secondary-700">
                + Add New Supplier
              </p>
            </button>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <UserPlus size={16} className="text-gray-400" />
                  New Supplier Details
                </h4>
                <button
                  type="button"
                  onClick={() => { setShowNewSupplierInput(false); setNewSupplierError(""); }}
                  className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter supplier name"
                    value={newSupplierName}
                    onChange={(e) => { setNewSupplierName(e.target.value); setNewSupplierError(""); }}
                    className={`w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 outline-none bg-white focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 ${
                      newSupplierError ? "border-red-400 bg-red-50" : ""
                    }`}
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleAddSupplier()}
                  />
                  {newSupplierError && <p className={errorCls}>{newSupplierError}</p>}
                </div>
                <button
                  type="button"
                  onClick={handleAddSupplier}
                  className="h-10 px-4 flex items-center gap-2 rounded-lg text-sm font-semibold transition-all text-white bg-secondary-500 hover:bg-secondary-600"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Price */}
      <div>
        <label className={labelCls}>
          {priceLabel} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="0"
          placeholder="0.00"
          value={data[priceField] ?? ""}
          onChange={(e) => set(priceField, e.target.value)}
          className={`${inputCls} ${errors[priceField] ? "border-red-400 bg-red-50/30" : ""}`}
        />
        {errors[priceField] && <p className={errorCls}>{errors[priceField]}</p>}
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
