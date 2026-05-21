"use client";

import { Icon } from "@iconify/react";

export default function Button({
  onClick,
  title,
  icon,
  disabled = false,
  loading = false,
  className = "",
  variant = "primary",
  type = "button",
  children,
}) {
  const base =
    "h-11 px-5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all w-full";

  const variants = {
    primary:
      "bg-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary-500/20",
    secondary:
      "bg-secondary-500 text-white hover:bg-secondary-600 shadow-md shadow-secondary-500/20",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      title={title}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading ? (
        "Loading..."
      ) : (
        <>
          {icon && <Icon icon={icon} className="w-4 h-4" />}
          {children}
        </>
      )}
    </button>
  );
}