"use client";

import { forwardRef, useState } from "react";
import { Icon } from "@iconify/react";

const InputField = forwardRef(
  ({ label, error, required, type = "text", className, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label */}
        <label className="text-sm font-semibold text-primary-600">
          {label}
          {required && (
            <span className="text-secondary-500 ml-1">*</span>
          )}
        </label>

        {/* Input */}
        <div className="relative">
          {/* Left Icon */}
          {icon && (
            <Icon
              icon={icon}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 text-lg"
            />
          )}

          <input
            ref={ref}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            className={`
              w-full h-12 rounded-xl border-2 text-primary-800 text-sm
              placeholder:text-primary-300 outline-none transition-all duration-200
              bg-white
              ${icon ? "pl-12" : "pl-4"}
              ${isPassword ? "pr-12" : "pr-4"}
              ${
                error
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-primary-200 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-100"
              }
              ${className || ""}
            `}
            {...props}
          />

          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-secondary-600 transition"
            >
              <Icon
                icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                className="text-lg"
              />
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;