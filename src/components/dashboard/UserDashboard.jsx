"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

const myJobs = [
  { service: "Home Cleaning",  date: "2026-05-21", status: "in-progress" },
  { service: "AC Repair",      date: "2026-05-18", status: "completed" },
  { service: "Plumbing Fix",   date: "2026-05-15", status: "completed" },
];

const statusColors = {
  "in-progress": { bg: "#fff8ed", color: "#e07b39" },
  completed:     { bg: "#eef8ed", color: "#4CA048" },
  cancelled:     { bg: "#fff5f5", color: "#e53e3e" },
};

export default function UserDashboard({ user }) {
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div
        className="rounded-2xl p-6 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #1f2325 0%, #272c2f 100%)", border: "1px solid #2f3539" }}
      >
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "#4CA048" }}>
            Hello there 👋
          </p>
          <h1 className="text-2xl font-bold text-white">
            {user?.fullName || "User"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#9ca3a7" }}>
            Manage your bookings and profile from here.
          </p>
        </div>
        <div
          className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl"
          style={{ background: "#4CA048" }}
        >
          <Icon icon="solar:user-bold-duotone" className="text-3xl text-white" />
        </div>
      </div>

      {/* Profile & Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded-2xl p-5 col-span-1"
          style={{ background: "#fff", border: "1px solid #dfe2e3" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4"
            style={{ background: "#eef8ed", color: "#4CA048" }}
          >
            {(user?.fullName || "U").charAt(0).toUpperCase()}
          </div>
          <h3 className="font-bold text-lg" style={{ color: "#141718" }}>{user?.fullName || "User"}</h3>
          <p className="text-sm mt-1" style={{ color: "#9ca3a7" }}>{user?.email}</p>
          <span
            className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
            style={{ background: "#eef8ed", color: "#4CA048" }}
          >
            {user?.role || "user"}
          </span>
        </div>

        <div
          className="rounded-2xl p-5 sm:col-span-2 flex flex-col justify-between"
          style={{ background: "#fff", border: "1px solid #dfe2e3" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#eef8ed" }}>
              <Icon icon="solar:shield-check-bold-duotone" style={{ fontSize: 22, color: "#4CA048" }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: "#141718" }}>Account Status</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#eef8ed", color: "#4CA048" }}>
                Verified & Active
              </span>
            </div>
          </div>
          <p className="text-sm" style={{ color: "#9ca3a7" }}>
            Your account is fully verified and active. You can book services and manage your appointments.
          </p>
          <Link
            href="/dashboard/profile"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl w-fit transition-colors"
            style={{ background: "#4CA048", color: "#fff" }}
          >
            <Icon icon="solar:pen-bold" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Recent jobs */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #dfe2e3" }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid #dfe2e3" }}
        >
          <h2 className="text-base font-bold" style={{ color: "#141718" }}>My Recent Bookings</h2>
          <Link href="/dashboard/my-jobs" className="text-sm font-medium" style={{ color: "#4CA048" }}>
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f4f5f5" }}>
                {["Service", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ca3a7" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myJobs.map((j, i) => (
                <tr key={j.service + i} style={i % 2 === 1 ? { background: "#f4f5f5" } : {}}>
                  <td className="px-6 py-3 text-sm font-medium" style={{ color: "#272c2f" }}>{j.service}</td>
                  <td className="px-6 py-3 text-sm" style={{ color: "#9ca3a7" }}>{j.date}</td>
                  <td className="px-6 py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={statusColors[j.status]}>
                      {j.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
