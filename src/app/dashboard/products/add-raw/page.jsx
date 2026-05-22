"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

import StepIndicator from "@/components/ui/StepIndicator";
import Step1ProductDetails from "@/components/raw-material/Step1ProductDetails";
import Step2Measurements from "@/components/raw-material/Step2Measurements";
import Step3SupplierInfo from "@/components/raw-material/Step3SupplierInfo";
import Step4ReviewSubmit from "@/components/raw-material/Step4ReviewSubmit";

const INITIAL_FORM = {
  // Step 1
  productName: "This is Product Name",
  standard: false,
  thumbnail: null,
  description: "lorem",
  denominationPackSize: "",
  // Step 2
  lengthMM: "",
  widthMM: "",
  heightMM: "",
  installationTimeMins: "",
  weightKgs: "",
  images: [],
  // Step 3
  supplier: "",
  rawMaterialPrice: "",
  supplierSKU: "",
};

const MOCK_SUPPLIERS = [
  { value: "supplier-1", label: "Acme Steel Supplies" },
  { value: "supplier-2", label: "BuildPro Materials" },
  { value: "supplier-3", label: "Metro Hardware Ltd." },
  { value: "supplier-4", label: "GlobalRaw Co." },
  { value: "supplier-5", label: "Precision Parts Inc." },
];

const STEP_LABELS = ["Product Details", "Measurements", "Supplier Info", "Review"];

export default function AddRawMaterialPage() {
  const [step, setStep] = useState(1);
  // BUG 2 FIX: track completed steps in a persistent array
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  // BUG 1 FIX: scroll to top on step change, accounting for topbar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const updateForm = (patch) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  // BUG 2 FIX: mark current step completed before advancing
  const handleNext = () => {
    setCompletedSteps((prev) => [...new Set([...prev, step])]);
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = () => {
    const output = {
      productName: formData.productName,
      standard: formData.standard,
      thumbnail: formData.thumbnail,
      description: formData.description,
      denominationPackSize: Number(formData.denominationPackSize) || 0,
      lengthMM: Number(formData.lengthMM) || 0,
      widthMM: Number(formData.widthMM) || 0,
      heightMM: Number(formData.heightMM) || 0,
      installationTimeMins: Number(formData.installationTimeMins) || 0,
      weightKgs: Number(formData.weightKgs) || 0,
      images: formData.images,
      supplier: formData.supplier,
      rawMaterialPrice: Number(formData.rawMaterialPrice) || 0,
      supplierSKU: formData.supplierSKU,
    };
    console.log("✅ Raw Material Submitted:", output);
    toast.success("Raw material submitted successfully!");
    setSubmitted(true);
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
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto" style={{ background: "#eef8ed" }}>
            <Icon icon="solar:check-circle-bold" style={{ fontSize: 52, color: "#4CA048" }} />
          </div>
          <div>
            <h2 className="text-2xl  text-primary-600">Raw Material Added!</h2>
            <p className="text-primary-400 text-sm mt-2">
              The product has been submitted. Check your console for the full data object.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-full h-12 px-5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 text-white"
            style={{ backgroundColor: "#4CA048" }}
          >
            <Icon icon="solar:add-circle-bold" className="text-base" />
            Add Another
          </button>
        </div>
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
            <h1 className="text-2xl " style={{ color: "#2f3539" }}>
              Add Raw Material
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#6f787d" }}>
              Fill in the details below to add a new raw product
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <Icon icon="solar:list-bold" className="text-base" style={{ color: "#6f787d" }} />
            <span className="text-xs font-semibold" style={{ color: "#383F43" }}>
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
            />
          )}
          {step === 2 && (
            <Step2Measurements
              data={formData}
              onChange={updateForm}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 3 && (
            <Step3SupplierInfo
              data={formData}
              onChange={updateForm}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 4 && (
            <Step4ReviewSubmit
              data={formData}
              suppliers={MOCK_SUPPLIERS}
              onBack={handleBack}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
