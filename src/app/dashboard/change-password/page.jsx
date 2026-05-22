"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import axiosInstance from "@/utils/AxiosInstance";

const schema = yup.object().shape({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .notOneOf(
      [yup.ref("currentPassword")],
      "New password cannot be the same as current password"
    )
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords do not match")
    .required("Please confirm your new password"),
});

export default function ChangePasswordPage() {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (res.data.success) {
        setSuccess(true);
        reset();
        toast.success(res.data.message || "Password changed successfully!");
      } else {
        toast.error(res.data.message || "Failed to change password.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to change password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-secondary-50 flex items-center justify-center">
            <Icon
              icon="solar:lock-password-bold"
              className="text-secondary-500 text-xl"
            />
          </div>
          <div>
            <h1 className="text-2xl  text-primary-600">
              Change Password
            </h1>
            <p className="text-primary-400 text-sm">
              Update your account password
            </p>
          </div>
        </div>
      </div>

      {success ? (
        /* Success Banner */
        <div className="bg-secondary-50 border border-secondary-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0">
            <Icon
              icon="solar:check-circle-bold"
              className="text-secondary-500 text-2xl"
            />
          </div>
          <div>
            <h3 className="font-bold text-secondary-700 text-base">
              Password Changed!
            </h3>
            <p className="text-secondary-600 text-sm mt-1">
              Your password has been updated successfully. You&apos;re all set.
            </p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="mt-3 text-sm text-secondary-500 font-semibold hover:text-secondary-600 underline underline-offset-2"
            >
              Change again
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-8">
          {/* User Info Strip */}
          {user && (
            <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl mb-8">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-primary-700 text-sm">
                  {user.fullName || "User"}
                </p>
                <p className="text-primary-400 text-xs">{user.email}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <InputField
              label="Current Password"
              icon="solar:lock-password-linear"
              type="password"
              placeholder="Enter your current password"
              {...register("currentPassword")}
              error={errors.currentPassword?.message}
            />

            <div className="border-t border-primary-100 pt-5">
              <InputField
                label="New Password"
                icon="solar:lock-keyhole-bold"
                type="password"
                placeholder="Minimum 8 characters"
                {...register("newPassword")}
                error={errors.newPassword?.message}
              />
            </div>

            <InputField
              label="Confirm New Password"
              icon="solar:lock-keyhole-minimalistic-bold"
              type="password"
              placeholder="Repeat your new password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />

            {/* Password requirements */}
            <div className="bg-primary-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-primary-500 mb-2">
                Password Requirements
              </p>
              {[
                "At least 8 characters long",
                "Different from your current password",
                "Both new password fields must match",
              ].map((req) => (
                <div key={req} className="flex items-center gap-2">
                  <Icon
                    icon="solar:shield-check-bold"
                    className="text-secondary-400 text-sm flex-shrink-0"
                  />
                  <span className="text-xs text-primary-400">{req}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                variant="secondary"
                loading={loading}
                icon="solar:lock-password-bold"
              >
                Update Password
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
