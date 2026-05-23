"use client";

import { useMemo } from "react";
import { CheckCircle, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import StepWrapper from "@/components/ui/StepWrapper";

export default function Step4ReviewSubmit({
  data,
  suppliers = [],
  onBack,
  onSubmit,
  loading = false,
  productType = "raw",
}) {
  const labels = useMemo(() => {
    switch (productType) {
      case "theme":
        return {
          title: "Review Your New Theme",
          price: "Theme Price",
          priceField: "themePrice",
          createBtn: "Create Theme",
        };
      case "external":
        return {
          title: "Review Your New External Product",
          price: "External Price",
          priceField: "externalPrice",
          createBtn: "Create External",
        };
      case "raw":
      default:
        return {
          title: "Review Your New Raw Material",
          price: "Raw Material Price",
          priceField: "rawMaterialPrice",
          createBtn: "Create Raw",
        };
    }
  }, [productType]);

  const thumbUrl = useMemo(() => {
    return data.thumbnail ? URL.createObjectURL(data.thumbnail) : null;
  }, [data.thumbnail]);

  const copyToClipboard = () => {
    if (!data.generatedSKU) return;
    navigator.clipboard.writeText(data.generatedSKU);
    toast.success("SKU copied to clipboard!");
  };

  return (
    <StepWrapper
      stepNumber={4}
      title={labels.title}
      subtitle="Please confirm the details below"
      onNext={onSubmit}
      onBack={onBack}
      nextLabel={labels.createBtn}
      isLastStep
      loading={loading}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* IMAGE PREVIEW */}
        {thumbUrl && (
          <div className="bg-white border rounded-xl p-3 w-fit">
            <img
              src={thumbUrl}
              alt="thumbnail"
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        )}

        {/* MAIN CARD */}
        <div className="bg-gray-50 rounded-xl p-5 space-y-6">

          <div className="grid md:grid-cols-2 gap-6">

            {/* PRODUCT DETAILS */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Product Details
              </h2>

              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p><b>Name:</b> {data.productName || "N/A"}</p>

                <p>
                  <b>Standard:</b>{" "}
                  {data.standard ? "Yes" : "No"}
                </p>

                <p><b>Denomination:</b> {data.denominationPackSize || "N/A"}</p>

                <p><b>Description:</b> {data.description || "N/A"}</p>
              </div>
            </div>

            {/* SUPPLIER */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Supplier Info
              </h2>

              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>
                  <b>Supplier:</b>{" "}
                  {data.supplier
                    ? suppliers.find((s) => s.value === data.supplier)?.label
                    : "N/A"}
                </p>

                <p>
                  <b>{labels.price}:</b> £ {data[labels.priceField] || "0.00"}
                </p>
                {data.supplierSKU && (
                  <p>
                    <b>Supplier SKU:</b> {data.supplierSKU}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* DIMENSIONS (Hidden if all 0) */}
     <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
  <div>
    <h2 className="text-lg font-semibold text-gray-800">
      Dimensions & Weight
    </h2>

    <div className="mt-2 space-y-1 text-sm text-gray-600">
      <p><b>Length:</b> {data.lengthMM || 0} MM</p>
      <p><b>Width:</b> {data.widthMM || 0} MM</p>
      <p><b>Height:</b> {data.heightMM || 0} MM</p>
      <p><b>Installation Time:</b> {data.installationTimeMins || 0} MINS</p>
      <p><b>Weight:</b> {data.weightKgs || 0} KGS</p>
    </div>
  </div>
</div>

  <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Generated Product Name
          </h2>

        {/* SKU */}
        {data.generatedSKU && (
          <div className="flex items-center justify-between bg-white border rounded-xl p-3">
            <p className="text-sm text-gray-700">
            {data.generatedSKU}
            </p>

            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <Copy size={16} />
              Copy
            </button>
          </div>
        )}
        </div>
        </div>

        {/* GENERATED NAME */}
      
      </motion.div>
    </StepWrapper>
  );
}