"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import axiosInstance from "@/utils/AxiosInstance";

const schema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords do not match")
    .required("Please confirm your password"),
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("resetEmail");
    const savedToken = sessionStorage.getItem("resetToken");

    if (!savedEmail || !savedToken) {
      toast.error("Session expired. Please start over.");
      router.push("/auth/forgot-password");
      return;
    }

    setEmail(savedEmail);
    setResetToken(savedToken);
  }, [router]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/auth/reset-password", {
        email,
        resetToken,
        newPassword: data.newPassword,
      });

      if (res.data.success) {
        // Clean up session storage
        sessionStorage.removeItem("resetEmail");
        sessionStorage.removeItem("resetToken");
        sessionStorage.removeItem("resetOtpStartTime");

        setSuccess(true);
        toast.success(res.data.message || "Password reset successfully!");
        setTimeout(() => router.push("/auth/login"), 2500);
      } else {
        toast.error(res.data.message || "Failed to reset password.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reset password.";
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
                Set New <br />
                Password
              </h1>
              <p className="text-primary-100 text-sm max-w-sm mt-4">
                Almost done! Create a strong, new password for your account.
              </p>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="z-10 mt-12 space-y-3">
            {[
              { step: "1", label: "Enter your email", done: true, active: false },
              { step: "2", label: "Verify OTP code", done: true, active: false },
              { step: "3", label: "Set new password", done: false, active: true },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    item.done
                      ? "bg-secondary-400 text-white"
                      : item.active
                      ? "bg-secondary-500 text-white"
                      : "bg-primary-400/40 text-primary-100"
                  }`}
                >
                  {item.done ? (
                    <Icon icon="solar:check-bold" className="text-xs" />
                  ) : (
                    item.step
                  )}
                </div>
                <span
                  className={`text-sm ${
                    item.active
                      ? "text-white font-semibold"
                      : item.done
                      ? "text-secondary-200"
                      : "text-primary-300"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Decorative */}
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-secondary-400 rounded-full opacity-20 blur-3xl" />
          <div className="absolute top-10 -right-10 w-32 h-32 bg-primary-300 rounded-full opacity-20 blur-2xl" />
        </div>

        {/* RIGHT SIDE */}
        <div className="p-8 sm:p-10 lg:p-14 flex flex-col justify-center">
          {success ? (
            /* Success state */
            <div className="text-center space-y-5">
              <div className="w-20 h-20 bg-secondary-50 rounded-full flex items-center justify-center mx-auto">
                <Icon
                  icon="solar:check-circle-bold"
                  className="text-secondary-500 text-5xl"
                />
              </div>
              <h2 className="text-3xl  text-primary-600">
                Password Reset!
              </h2>
              <p className="text-primary-400 text-sm max-w-xs mx-auto">
                Your password has been updated successfully. Redirecting you to
                sign in...
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
                  New Password
                </h2>
                <p className="text-primary-400 mt-2 text-sm">
                  Create a strong password for{" "}
                  <span className="font-semibold text-primary-500 break-all">
                    {email}
                  </span>
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                  label="New Password"
                  icon="solar:lock-password-linear"
                  type="password"
                  placeholder="Minimum 8 characters"
                  {...register("newPassword")}
                  error={errors.newPassword?.message}
                />

                <InputField
                  label="Confirm New Password"
                  icon="solar:lock-password-bold"
                  type="password"
                  placeholder="Repeat your new password"
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                />

                {/* Password hint */}
                <ul className="text-xs text-primary-400 space-y-1 pl-1">
                  <li className="flex items-center gap-1.5">
                    <Icon icon="solar:info-circle-linear" className="flex-shrink-0" />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Icon icon="solar:info-circle-linear" className="flex-shrink-0" />
                    Cannot be the same as your old password
                  </li>
                </ul>

                <Button
                  type="submit"
                  variant="secondary"
                  loading={loading}
                  icon="solar:shield-keyhole-bold"
                >
                  Reset Password
                </Button>
              </form>

              <p className="text-center text-primary-400 text-sm mt-8">
                Remembered your password?{" "}
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
