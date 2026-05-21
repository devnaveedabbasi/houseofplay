"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/store/authSlice";
import toast from "react-hot-toast";
import Link from "next/link";
import { Icon } from "@iconify/react";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import Image from "next/image";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

const onSubmit = async (data) => {
  try {
    const resultAction = await dispatch(login(data));

    if (login.fulfilled.match(resultAction)) {
      toast.success("Logged in successfully!");
      router.push("/dashboard");

    } else if (login.rejected.match(resultAction)) {
      const error = resultAction.payload;

      if (error?.requiresVerification || error?.code === 403) {
        toast.error(error?.message || "Please verify your email first.");
        sessionStorage.setItem("verifyEmail", data.email);
        router.push("/auth/verify-otp");
      } else {
        toast.error(error?.message || "Login failed.");
      }
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || error?.message || "Something went wrong.");
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-secondary-200 rounded-full blur-3xl opacity-30 -translate-x-20 -translate-y-20"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary-200 rounded-full blur-3xl opacity-30 translate-x-20 translate-y-20"></div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-[28px] shadow-2xl overflow-hidden border border-primary-100 z-10">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col  justify-start bg-primary-500 text-white p-12 relative overflow-hidden">

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
            <h1 className="text-4xl font-black mt-28  leading-tight">
              Welcome <br />
              Back 
            </h1>

            <p className="text-primary-100 text-sm max-w-sm">
              Sign in to continue managing your dashboard and workflow with ease.
            </p>
</div>
          </div>

          {/* decorative */}
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-secondary-400 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute top-10 -right-10 w-32 h-32 bg-primary-300 rounded-full opacity-20 blur-2xl"></div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-8 sm:p-10 lg:p-14">

          <h2 className="text-4xl font-black text-primary-600">
            Sign In
          </h2>

          <p className="text-primary-400 mt-2 mb-8">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

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

            {/* BUTTON */}
            <Button
              type="submit"
              variant="secondary"
              loading={loading}
              icon="solar:login-3-linear"
            >
              Sign In
            </Button>
          </form>

          {/* FOOTER */}
          <p className="text-center text-primary-400 text-sm mt-8">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-secondary-500 font-semibold hover:text-secondary-600"
            >
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}