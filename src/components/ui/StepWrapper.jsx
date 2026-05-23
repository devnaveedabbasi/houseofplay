"use client";

import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

export default function StepWrapper({
  stepNumber,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = "Next Step",
  isLastStep = false,
  loading = false,
}) {
  return (
    <div className="flex flex-col">
      {/* Step Header — green left border accent */}
      <div className="border-l-4 pl-4 mb-7 border-secondary-500">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-bold uppercase tracking-widest text-secondary-500"
          >
            Step {stepNumber}
          </span>
          {subtitle && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400 font-medium">{subtitle}</span>
            </>
          )}
        </div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>

      {/* Fields */}
      <div className="space-y-5">{children}</div>

      {/* Navigation Buttons — separated by top border */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="h-11 px-5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold border-2 border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-all whitespace-nowrap"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        ) : (
          <div /> /* spacer keeps Next right-aligned on first step if needed */
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          className={`flex-1 h-12 px-5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all text-white bg-secondary-500 hover:bg-secondary-600 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </>
          ) : isLastStep ? (
            <>
              <CheckCircle size={17} strokeWidth={2.5} />
              {nextLabel}
            </>
          ) : (
            <>
              {nextLabel}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
