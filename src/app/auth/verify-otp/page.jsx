"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import { setCredentials } from "@/store/authSlice";
import Button from "@/components/ui/Button";
import axiosInstance from "@/utils/AxiosInstance";

const schema = yup.object().shape({
  otp: yup.string().length(6, "OTP must be exactly 6 digits").required(),
});

export default function VerifyOtpPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading: reduxLoading } = useSelector((state) => state.auth);
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
    const savedEmail = sessionStorage.getItem("verifyEmail");
    const savedTimer = sessionStorage.getItem("otpTimer");
    const savedTime = sessionStorage.getItem("otpStartTime");

    if (!savedEmail) {
      toast.error("No email found. Please register again.");
      router.push("/auth/register");
      return;
    }

    setEmail(savedEmail);

    // Restore timer if exists
    if (savedTime && savedTimer) {
      const elapsed = Math.floor((Date.now() - parseInt(savedTime)) / 1000);
      const remaining = Math.max(60 - elapsed, 0);
      setTimer(remaining);
      setCanResend(remaining === 0);
    }
  }, [router]);

  // Timer Logic
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setCanResend(true);
          sessionStorage.removeItem("otpTimer");
          sessionStorage.removeItem("otpStartTime");
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timer]);

  // Save timer to sessionStorage
  useEffect(() => {
    if (timer > 0) {
      sessionStorage.setItem("otpTimer", timer);
      sessionStorage.setItem("otpStartTime", Date.now());
    }
  }, [timer]);

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

  // Handle Paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      setValue("otp", pastedData);
      inputsRef.current[5]?.focus();
    }
  };

const onSubmit = async (data) => {
  setLoading(true);

  try {
    const response = await axiosInstance.post("/api/auth/verify-otp", {
      email,
      otp: data.otp,
    });

    const res = response.data;

    // Store token + hydrate Redux directly from the response
    // (no extra /me round-trip needed)
    if (res.data?.token && res.data?.user) {
      dispatch(setCredentials(res.data.user, res.data.token));
    }

    sessionStorage.removeItem("verifyEmail");
    sessionStorage.removeItem("otpTimer");
    sessionStorage.removeItem("otpStartTime");

    toast.success(res.message || "Email verified successfully!");
    router.push("/dashboard");

  } catch (error) {
    const res = error?.response?.data;

    if (res?.statusCode === 404) {
      toast.error(res.message || "User not found.");
      router.push("/auth/register");
    } else {
      toast.error(res?.message || error?.message || "Invalid OTP. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    toast.loading("Sending new OTP...", { id: "resend" });

    try {
      const response = await axiosInstance.post("/api/auth/resend-otp", { email });
      const res = await response.data;

      if (res.success) {
        setTimer(60);
        setCanResend(false);
        toast.success("New OTP sent successfully!", { id: "resend" });
      } else {
        if (res.statusCode === 429) {
          toast.error("Too many resend attempts. Please try again later.", { id: "resend" });
        } else {
          toast.error(res.message || "Failed to resend OTP", { id: "resend" });
        }
      }
    } catch {
      toast.error("Network error. Please try again.", { id: "resend" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-primary-300 to-violet-300 rounded-full blur-[140px] opacity-25" />
      </div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-10 z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-500 mt-2">
            Enter the 6-digit code sent to
          </p>
          <p className="font-medium text-primary-600 break-all">{email}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* OTP Inputs */}
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={otp[i] || ""}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                maxLength={1}
                inputMode="numeric"
                className="w-12 h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 bg-white"
              />
            ))}
          </div>

          {errors.otp && (
            <p className="text-red-500 text-sm text-center font-medium">
              {errors.otp.message}
            </p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="secondary"

            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <Icon icon="eos-icons:loading" className="text-xl animate-spin" />
            ) : (
              "Verify OTP"
            )}
          </Button>
        </form>

        {/* Resend OTP */}
        <div className="text-center mt-6">
          {canResend ? (
            <Button
              variant="text"
              onClick={handleResend}
            >
              Resend OTP
            </Button>
          ) : (
            <p className="text-gray-500 text-sm">
              Resend code in <span className="font-mono font-medium text-primary-600">{timer}s</span>
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Wrong email?{" "}
          <Link
            href="/auth/register"
            className="text-secondary-500 font-semibold hover:underline"
          >
            Change Email
          </Link>
        </p>
      </div>
    </div>
  );
}