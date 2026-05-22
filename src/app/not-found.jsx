"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 relative overflow-hidden px-4">

      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-secondary-200 rounded-full blur-3xl opacity-30 -translate-x-20 -translate-y-20" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary-200 rounded-full blur-3xl opacity-30 translate-x-20 translate-y-20" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white border border-primary-100 rounded-3xl shadow-2xl p-10 text-center">

        {/* Icon */}
        <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-2xl bg-secondary-500/10 border border-secondary-200">
          <Icon
            icon="solar:danger-triangle-bold-duotone"
            className="text-5xl text-secondary-500"
          />
        </div>

        {/* Title */}
        <h1 className="text-5xl  text-primary-600 mt-6">
          404
        </h1>

        <h2 className="text-xl font-bold text-primary-500 mt-2">
          Page Not Found
        </h2>

        <p className="text-primary-400 text-sm mt-3 leading-relaxed">
          The page you are looking for doesn’t exist or has been moved.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-3">

          <Link
            href="/"
            className="h-12 flex items-center justify-center rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white font-semibold transition-all shadow-lg shadow-secondary-500/20"
          >
            Go Home
          </Link>

          <Link
            href="/login"
            className="h-12 flex items-center justify-center rounded-xl border border-primary-200 text-primary-600 hover:bg-primary-50 font-semibold transition-all"
          >
            Back to Login
          </Link>

        </div>
      </div>
    </div>
  );
}