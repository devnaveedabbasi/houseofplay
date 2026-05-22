"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import axiosInstance from "@/utils/AxiosInstance";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/auth/forgot-password", {
        email: data.email,
      });

      if (res.data.success) {
        // Store email for subsequent steps
        sessionStorage.setItem("resetEmail", data.email);
        sessionStorage.setItem("resetOtpStartTime", Date.now().toString());
        setSent(true);
        toast.success(res.data.message || "Reset OTP sent to your email!");
        setTimeout(() => router.push("/auth/reset-otp"), 1500);
      } else {
        toast.error(res.data.message || "Something went wrong.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send reset email.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-secondary-200 rounded-full blur-3xl opacity-30 -translate-x-20 -translate-y-20" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary-200 rounded-full blur-3xl opacity-30 translate-x-20 translate-y-20" />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-[28px] shadow-2xl overflow-hidden border border-primary-100 z-10">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col justify-start bg-primary-500 text-white p-12 relative overflow-hidden">
          <div className="z-10 space-y-5">
            <div className="z-10 mt-8">
              <Image
                src="/logo.png"
                alt="Logo"
                width={160}
                height={50}
                className="h-auto w-auto"
              />
            </div>
            <div className="z-10 mt-8">
              <h1 className="text-4xl  mt-28 leading-tight">
                Forgot <br />
                Password?
              </h1>
              <p className="text-primary-100 text-sm max-w-sm mt-4">
                No worries! Enter your email and we&apos;ll send you a 6-digit
                code to reset your password.
              </p>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="z-10 mt-12 space-y-3">
            {[
              { step: "1", label: "Enter your email", active: true },
              { step: "2", label: "Verify OTP code", active: false },
              { step: "3", label: "Set new password", active: false },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    item.active
                      ? "bg-secondary-500 text-white"
                      : "bg-primary-400/40 text-primary-100"
                  }`}
                >
                  {item.step}
                </div>
                <span
                  className={`text-sm ${
                    item.active ? "text-white font-semibold" : "text-primary-300"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Decorative circles */}
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-secondary-400 rounded-full opacity-20 blur-3xl" />
          <div className="absolute top-10 -right-10 w-32 h-32 bg-primary-300 rounded-full opacity-20 blur-2xl" />
        </div>

        {/* RIGHT SIDE */}
        <div className="p-8 sm:p-10 lg:p-14 flex flex-col justify-center">
          {sent ? (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary-50 rounded-full flex items-center justify-center mx-auto">
                <Icon
                  icon="solar:check-circle-bold"
                  className="text-secondary-500 text-4xl"
                />
              </div>
              <h2 className="text-2xl  text-primary-600">Email Sent!</h2>
              <p className="text-primary-400 text-sm">
                Redirecting you to verify your OTP...
              </p>
              <div className="flex justify-center">
                <Icon
                  icon="eos-icons:loading"
                  className="text-secondary-500 text-2xl animate-spin"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-4xl  text-primary-600">
                  Forgot Password
                </h2>
                <p className="text-primary-400 mt-2">
                  Enter your registered email to receive a reset code
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                  label="Email Address"
                  icon="solar:letter-linear"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  error={errors.email?.message}
                />

                <Button
                  type="submit"
                  variant="secondary"
                  loading={loading}
                  icon="solar:letter-bold"
                >
                  Send Reset Code
                </Button>
              </form>

              <p className="text-center text-primary-400 text-sm mt-8">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="text-secondary-500 font-semibold hover:text-secondary-600"
                >
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
