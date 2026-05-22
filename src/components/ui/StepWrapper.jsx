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
}) {
  return (
    <div className="flex flex-col">
      {/* Step Header — green left border accent */}
      <div className="border-l-4 pl-4 mb-7" style={{ borderColor: "#4CA048" }}>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "#4CA048" }}
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
          className="flex-1 h-12 px-5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all text-white"
          style={{ backgroundColor: "#4CA048" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3e853b")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4CA048")}
        >
          {isLastStep ? (
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
