"use client";


export default function AuthLayout({ children }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-50">
        <div className="w-full ">{children}</div>
    </div>
  );
}