"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";

import Image from "next/image";
import axiosInstance from "@/utils/AxiosInstance";

const schema = yup.object().shape({
  fullName: yup.string().required("Full Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6).required("Password is required"),
  role: yup.string().oneOf(["user", "admin", "manager"]).required(),
});

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: "user" },
  });

  const role = watch("role");

 const onSubmit = async (data) => {
  setLoading(true);

  try {
    const response = await axiosInstance.post("/api/auth/register", data);
    const res = response.data;

    toast.success(res.message);
    sessionStorage.setItem("verifyEmail", data.email);
    router.push("/auth/verify-otp");

  } catch (error) {
    const msg = error?.response?.data?.message || error?.message || "Something went wrong.";
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};

  const roles = [
    { label: "User", value: "user" },
    { label: "Manager", value: "manager" },
    { label: "Admin", value: "admin" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4 py-10 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-secondary-200 rounded-full blur-3xl opacity-30 -translate-x-20 -translate-y-20"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary-200 rounded-full blur-3xl opacity-30 translate-x-20 translate-y-20"></div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-[28px] shadow-2xl overflow-hidden border border-primary-100 z-10">

        {/* LEFT */}
        <div className="hidden lg:flex flex-col gap-48 justify-start bg-primary-500 text-white p-12 relative overflow-hidden">

          {/* TOP: LOGO ONLY */}
          <div className="z-10 mt-8">
            <Image
              src="/logo.png"
              alt="Logo"
              width={160}
              height={50}
              className="h-auto w-auto"
            />
          </div>

          {/* CENTER CONTENT */}
          <div className="z-10 space-y-5">
            <h1 className="text-[42px]  leading-[1.1] tracking-tight text-white">
              Start your <br />
              journey{" "}
              <span className="text-secondary-300">today.</span>
            </h1>

            <p className="text-primary-100 text-sm leading-relaxed max-w-sm">
              Create an account and manage everything from one powerful dashboard.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {["Secure Auth", "Role Based Access", "Real-time Data"].map((f) => (
                <span
                  key={f}
                  className="text-xs text-secondary-300 bg-secondary-500/10 border border-secondary-400/20 px-3 py-1.5 rounded-full"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* DECORATIVE ELEMENTS */}
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-secondary-400 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute top-10 -right-10 w-32 h-32 bg-primary-300 rounded-full opacity-20 blur-2xl"></div>

        </div>
        {/* RIGHT */}
        <div className="p-8 sm:p-10 lg:p-14">

          <h2 className="text-4xl  text-primary-600">
            Register
          </h2>

          <p className="text-primary-400 mt-2 mb-8">
            Fill your details to create account
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* FULL NAME */}
            <InputField
              label="Full Name"
              icon="solar:user-linear"
              placeholder="John Doe"
              {...register("fullName")}
              error={errors.fullName?.message}
            />

            {/* EMAIL */}
            <InputField
              label="Email"
              icon="solar:letter-linear"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              error={errors.email?.message}
            />
            {/* PASSWORD */}
            <InputField
              label="Password"
              icon="solar:lock-password-linear"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
            />

            {/* ROLE DROPDOWN */}
            <Dropdown
              icon="solar:shield-user-linear"
              placeholder="Select Role"
              options={roles}
              value={role}
              onChange={(val) => setValue("role", val)}
            />

            {/* BUTTON */}
            <Button
              type="submit"
              variant="secondary"
              loading={loading}
              icon="solar:user-plus-linear"
            >
              Create Account
            </Button>
          </form>

          {/* FOOTER */}
          <p className="text-center text-primary-400 text-sm mt-8">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-secondary-500 font-semibold hover:text-secondary-600"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}