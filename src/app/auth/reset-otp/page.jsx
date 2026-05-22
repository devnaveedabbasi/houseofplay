"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Image from "next/image";

import Button from "@/components/ui/Button";
import axiosInstance from "@/utils/AxiosInstance";

const schema = yup.object().shape({
  otp: yup.string().length(6, "OTP must be exactly 6 digits").required(),
});

export default function ResetOtpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputsRef = useRef([]);
  const timerRef = useRef(null);

  const {
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { otp: "" },
  });

  const otp = watch("otp") || "";

  // Load email & restore timer from sessionStorage
  useEffect(() => {
    const savedEmail = sessionStorage.getItem("resetEmail");
    const savedStartTime = sessionStorage.getItem("resetOtpStartTime");

    if (!savedEmail) {
      toast.error("No email found. Please start over.");
      router.push("/auth/forgot-password");
      return;
    }

    setEmail(savedEmail);

    // Restore timer
    if (savedStartTime) {
      const elapsed = Math.floor((Date.now() - parseInt(savedStartTime)) / 1000);
      const remaining = Math.max(60 - elapsed, 0);
      setTimer(remaining);
      setCanResend(remaining === 0);
    }
  }, [router]);

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setCanResend(true);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timer]);

  // OTP input handlers
  const handleChange = (value, index) => {
    const otpArr = otp.split("");
    otpArr[index] = value.replace(/\D/g, "").slice(0, 1);
    const newOtp = otpArr.join("").slice(0, 6);
    setValue("otp", newOtp);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      setValue("otp", pasted);
      inputsRef.current[5]?.focus();
    }
  };

  // Submit OTP
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/auth/verify-reset-otp", {
        email,
        otp: data.otp,
      });

      if (res.data.success) {
        // Store reset token for next step
        sessionStorage.setItem("resetToken", res.data.data.resetToken);
        toast.success(res.data.message || "OTP verified!");
        router.push("/auth/reset-password");
      } else {
        toast.error(res.data.message || "Invalid OTP.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid OTP. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    const toastId = toast.loading("Sending new OTP...");
    try {
      const res = await axiosInstance.post("/api/auth/resend-reset-otp", {
        email,
      });

      if (res.data.success) {
        setTimer(60);
        setCanResend(false);
        sessionStorage.setItem("resetOtpStartTime", Date.now().toString());
        toast.success("New OTP sent!", { id: toastId });
      } else {
        toast.error(res.data.message || "Failed to resend OTP.", {
          id: toastId,
        });
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message === "OTP resend limit"
          ? "Too many resend attempts. Please try again later."
          : error?.response?.data?.message || "Network error. Please try again.";
      toast.error(msg, { id: toastId });
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
                Verify <br />
                Your Code
              </h1>
              <p className="text-primary-100 text-sm max-w-sm mt-4">
                We sent a 6-digit code to your email. Enter it below to
                continue resetting your password.
              </p>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="z-10 mt-12 space-y-3">
            {[
              { step: "1", label: "Enter your email", active: false, done: true },
              { step: "2", label: "Verify OTP code", active: true, done: false },
              { step: "3", label: "Set new password", active: false, done: false },
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
          <div className="mb-8">
            <h2 className="text-4xl  text-primary-600">
              Enter OTP
            </h2>
            <p className="text-primary-400 mt-2 text-sm">
              We sent a 6-digit code to
            </p>
            <p className="font-semibold text-primary-600 text-sm break-all">
              {email}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* OTP Boxes */}
            <div
              className="flex justify-center gap-3"
              onPaste={handlePaste}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  value={otp[i] || ""}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  maxLength={1}
                  inputMode="numeric"
                  className={`w-12 h-16 text-center text-2xl font-bold border-2 rounded-2xl outline-none transition-all duration-200 bg-white ${
                    otp[i]
                      ? "border-secondary-500 text-primary-700"
                      : "border-primary-200 text-primary-400 focus:border-secondary-400 focus:ring-2 focus:ring-secondary-100"
                  }`}
                />
              ))}
            </div>

            {errors.otp && (
              <p className="text-red-500 text-sm text-center font-medium">
                {errors.otp.message}
              </p>
            )}

            <Button
              type="submit"
              variant="secondary"
              loading={loading}
              disabled={loading || otp.length !== 6}
              icon="solar:shield-check-bold"
            >
              Verify OTP
            </Button>
          </form>

          {/* Resend & Timer */}
          <div className="text-center mt-6">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-secondary-500 text-sm font-semibold hover:text-secondary-600 transition disabled:opacity-50"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-primary-400 text-sm">
                Resend code in{" "}
                <span className="font-semibold text-primary-600">
                  {timer}s
                </span>
              </p>
            )}
          </div>

          <p className="text-center text-xs text-primary-300 mt-8">
            Wrong email?{" "}
            <Link
              href="/auth/forgot-password"
              className="text-secondary-500 font-semibold hover:underline"
            >
              Go back
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
