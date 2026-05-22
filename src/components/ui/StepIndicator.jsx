"use client";

import { CheckCircle2 } from "lucide-react";

export default function StepIndicator({
  currentStep,
  completedSteps = [],  // BUG 2 FIX: accept array from parent
  totalSteps = 4,
  labels = [],
}) {
  return (
    <div className="w-full">
      <div className="flex items-start justify-between relative">

        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1;
          // BUG 2 FIX: check completedSteps FIRST — never override with active
          const isCompleted = completedSteps.includes(stepNum);
          const isActive = !isCompleted && stepNum === currentStep;
          const isUpcoming = !isCompleted && !isActive;

          // Connector line: rendered after each step except the last
          const nextIsCompleted = completedSteps.includes(stepNum + 1) || completedSteps.includes(stepNum) ;
          const connectorGreen = isCompleted;

          return (
            <div key={stepNum} className="flex flex-col items-center flex-1 relative">

              {/* Connector line (except after last step) */}
              {i < totalSteps - 1 && (
                <div
                  className="absolute top-5 left-1/2 right-0 h-0.5 transition-colors duration-300 !z-0"
                  style={{
                    width: "100%",
                    left: "50%",
                    backgroundColor: connectorGreen ? "#4CA048" : "#e5e7eb",
                  }}
                />
              )}

              {/* Circle */}
              <div
                className={`
                  relative z-2 w-10 h-10 rounded-full flex items-center justify-center
                  font-bold text-sm transition-all duration-300 select-none
                  ${isCompleted
                    ? "text-white shadow-md"
                    : isActive
                    ? "text-white shadow-lg ring-4"
                    : "bg-white border-2 border-gray-200 text-gray-400"
                  }
                `}
                style={
                  isCompleted
                    ? { backgroundColor: "#4CA048", boxShadow: "0 4px 12px rgba(76,160,72,0.35)" }
                    : isActive
                    ? {
                        backgroundColor: "#4CA048",
                        boxShadow: "0 4px 14px rgba(76,160,72,0.4)",
                        ringColor: "rgba(76,160,72,0.25)",
                        outline: "4px solid rgba(76,160,72,0.2)",
                      }
                    : {}
                }
              >
                {isCompleted ? (
                  <CheckCircle2 size={20} color="white" strokeWidth={2.5} />
                ) : (
                  <span>{stepNum}</span>
                )}
              </div>

              {/* Label */}
              {labels[i] && (
                <span
                  className={`
                    mt-2 text-xs text-nowrap text-center z-4 leading-tight font-medium
                    transition-colors duration-300 max-w-[72px]
                    hidden sm:block
                    ${isCompleted
                      ? "text-green-600"
                      : isActive
                      ? "font-semibold"
                      : "text-gray-400"
                    }
                  `}
                  style={
                    isActive ? { color: "#4CA048" } : {}
                  }
                >
                  {labels[i]}
                </span>
              )}

              {/* Mobile: only show active label */}
              {labels[i] && isActive && (
                <span
                  className="mt-2 text-xs text-center leading-tight font-semibold sm:hidden"
                  style={{ color: "#4CA048" }}
                >
                  {labels[i]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
