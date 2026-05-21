"use client";

export default function Loader({ loading, title }) {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary-900/20 backdrop-blur-sm">
      <div className="bg-white px-8 py-6 rounded-2xl shadow-lg flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-secondary-200 border-t-secondary-500 rounded-full animate-spin"></div>
        <p className="text-primary-600 font-medium">{title}</p>
      </div>
    </div>
  );
}