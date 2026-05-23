"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchSuppliers, createSupplier, createRawMaterial } from "@/store/rawMaterialSlice";
import { useRouter } from "next/navigation";
import { generateSKU } from "@/utils/generateSKU";
import StepIndicator from "@/components/ui/StepIndicator";
import Step1ProductDetails from "@/components/shared-product-steps/Step1ProductDetails";
import Step2Measurements from "@/components/shared-product-steps/Step2Measurements";
import Step3SupplierInfo from "@/components/shared-product-steps/Step3SupplierInfo";
import Step4ReviewSubmit from "@/components/shared-product-steps/Step4ReviewSubmit";



const INITIAL_FORM = {
  // Step 1
  productName: "Premium Wooden Wall Panel",
  standard: true,

  thumbnail: null, // File object from input

  description:
    "Modern premium-quality wooden wall panel designed for luxury interiors. Crafted with durable engineered wood and smooth matte finishing for long-lasting performance and elegant appearance.",

  denominationPackSize: "1",

  // Step 2
  lengthMM: 0,
  widthMM: 0,
  heightMM: 0,
  installationTimeMins: 0,
  weightKgs: 0,

  images: [
  ],

  // Step 3
  supplier: "",
  rawMaterialPrice: "0",
  supplierSKU: "",
};
// MOCK_SUPPLIERS removed, now coming from Redux

const STEP_LABELS = ["Product Details", "Measurements", "Supplier Info", "Review"];

export default function AddRawMaterialPage() {
  const [step, setStep] = useState(1);
  // BUG 2 FIX: track completed steps in a persistent array
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { suppliers, loading } = useSelector((state) => state.rawMaterial);

  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchSuppliers())
      .unwrap()
      .catch(() => {}) // Ignore fetch errors here
      .finally(() => setIsPageLoading(false));
  }, [dispatch]);

  // BUG 1 FIX: scroll to top on step change, accounting for topbar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const updateForm = (patch) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  // BUG 2 FIX: mark current step completed before advancing
  const handleNext = () => {
    setCompletedSteps((prev) => [...new Set([...prev, step])]);
    if (step === 3) {
      const generatedSKU = generateSKU(formData);
      updateForm({ generatedSKU });
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("productName", formData.productName);
    data.append("standard", formData.standard);
    if (formData.description) data.append("description", formData.description);
    data.append("denominationPackSize", formData.denominationPackSize);
    
    data.append("measurements", JSON.stringify({
      lengthMM: Number(formData.lengthMM) || 0,
      widthMM: Number(formData.widthMM) || 0,
      heightMM: Number(formData.heightMM) || 0,
      installationTimeMins: Number(formData.installationTimeMins) || 0,
      weightKgs: Number(formData.weightKgs) || 0,
    }));
    
    if (formData.supplier) data.append("supplier", formData.supplier);
    data.append("rawMaterialPrice", formData.rawMaterialPrice);
    if (formData.supplierSKU) data.append("supplierSKU", formData.supplierSKU);
    
    if (formData.thumbnail) data.append("thumbnail", formData.thumbnail);
    
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach(img => data.append("images", img));
    }

    if (formData.generatedSKU) data.append("sku", formData.generatedSKU);

    try {
      await dispatch(createRawMaterial(data)).unwrap();
      setSubmitted(true);
      router.push("/dashboard/products/raw-materials");
    } catch (err) {
      // Error handled in slice/toast
    }
  };

  const handleCreateSupplier = async (name) => {
    try {
      const newSupplier = await dispatch(createSupplier(name)).unwrap();
      updateForm({ supplier: newSupplier._id });
    } catch (err) {
      // Error handled in slice/toast
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setStep(1);
    setCompletedSteps([]);
    setSubmitted(false);
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      // BUG 1 FIX: pt-20 to clear topbar
      <div className="min-h-[80vh] flex items-center justify-center p-6 pt-20 bg-slate-50">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-secondary-50">
            <Icon icon="solar:check-circle-bold" style={{ fontSize: 52 }} className="text-secondary-500" />
          </div>
          <div>
            <h2 className="text-2xl text-primary-600">Raw Material Added!</h2>
            <p className="text-primary-400 text-sm mt-2">
              The product has been submitted successfully.
            </p>
            {formData.generatedSKU && (
              <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-200">
                <p className="text-xs text-primary-600 font-semibold mb-1">Generated SKU</p>
                <p className="text-lg font-mono font-bold text-primary-700">{formData.generatedSKU}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-full h-12 px-5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 text-white bg-secondary-500 hover:bg-secondary-600"
          >
            <Icon icon="solar:add-circle-bold" className="text-base" />
            Add Another
          </button>
        </div>
      </div>
    );
  }

  // ── Skeleton Loader ─────────────────────────────────────────────────────────
  if (isPageLoading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 pt-8 space-y-6">
        <div className="h-8 bg-gray-200 rounded-lg w-1/4 animate-pulse"></div>
        <div className="h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="h-[400px] bg-gray-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  // ── Main Layout ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pb-10 space-y-5">
        {/* Page Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-semibold text-primary-600">
              Add Raw Material
            </h1>
            <p className="text-sm mt-0.5 text-primary-400">
              Fill in the details below to add a new raw product
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <Icon icon="solar:list-bold" className="text-base text-primary-400" />
            <span className="text-xs font-semibold text-primary-500">
              Step {step} of 4
            </span>
          </div>
        </div>

        {/* Step Indicator Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
          <StepIndicator
            currentStep={step}
            completedSteps={completedSteps}
            totalSteps={4}
            labels={STEP_LABELS}
          />
        </div>

        {/* Form Card — key={step} triggers CSS fade animation on step change */}
        <div
          key={step}
          className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8 animate-fadeIn"
        >
          {step === 1 && (
            <Step1ProductDetails
              data={formData}
              onChange={updateForm}
              onNext={handleNext}
              productType="raw"
            />
          )}
          {step === 2 && (
            <Step2Measurements
              data={formData}
              onChange={updateForm}
              onNext={handleNext}
              onBack={handleBack}
              productType="raw"
            />
          )}
          {step === 3 && (
            <Step3SupplierInfo
              data={formData}
              suppliers={suppliers.map(s => ({ value: s._id, label: s.name }))}
              onChange={updateForm}
              onNext={handleNext}
              onBack={handleBack}
              onCreateSupplier={handleCreateSupplier}
              productType="raw"
            />
          )}
          {step === 4 && (
            <Step4ReviewSubmit
              data={formData}
              suppliers={suppliers.map(s => ({ value: s._id, label: s.name }))}
              onBack={handleBack}
              onSubmit={handleSubmit}
              loading={loading}
              productType="raw"
            />
          )}
        </div>
      </div>
    </div>
  );
}
