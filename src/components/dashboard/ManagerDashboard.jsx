"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

const stats = [
  { label: "Pending Requests", value: "34",  icon: "solar:clipboard-list-bold-duotone",   color: "#4CA048", bg: "#eef8ed" },
  { label: "Active Jobs",      value: "21",  icon: "solar:case-bold-duotone",              color: "#4CA048", bg: "#eef8ed" },
  { label: "Total Providers",  value: "108", icon: "solar:user-check-bold-duotone",        color: "#383F43", bg: "#f4f5f5" },
  { label: "Services Listed",  value: "76",  icon: "solar:widget-bold-duotone",            color: "#383F43", bg: "#f4f5f5" },
];

const pendingRequests = [
  { service: "Home Cleaning",   provider: "Ali Hassan",  date: "2026-05-20", status: "pending" },
  { service: "Electrical Work", provider: "Raza Khan",   date: "2026-05-19", status: "approved" },
  { service: "Plumbing",        provider: "Omar Farooq", date: "2026-05-18", status: "pending" },
  { service: "Painting",        provider: "Tariq Bhai",  date: "2026-05-17", status: "rejected" },
];

const statusColors = {
  pending:  { bg: "#fff8ed", color: "#e07b39" },
  approved: { bg: "#eef8ed", color: "#4CA048" },
  rejected: { bg: "#fff5f5", color: "#e53e3e" },
};

export default function ManagerDashboard({ user }) {
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div
        className="rounded-2xl p-6 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #1f2325 0%, #2f3539 100%)", border: "1px solid #2f3539" }}
      >
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "#4CA048" }}>
            Operations Panel 👋
          </p>
          <h1 className="text-2xl font-bold text-white">
            {user?.fullName || "Manager"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#9ca3a7" }}>
            Review requests, manage services and track active jobs.
          </p>
        </div>
        <div
          className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl"
          style={{ background: "#4CA048" }}
        >
          <Icon icon="solar:settings-bold-duotone" className="text-3xl text-white" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: "#fff", border: "1px solid #dfe2e3" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: s.bg }}
            >
              <Icon icon={s.icon} style={{ fontSize: 22, color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "#141718" }}>{s.value}</p>
              <p className="text-sm" style={{ color: "#9ca3a7" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending requests table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #dfe2e3" }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid #dfe2e3" }}
        >
          <h2 className="text-base font-bold" style={{ color: "#141718" }}>
            Service Requests
          </h2>
          <Link
            href="/dashboard/requests"
            className="text-sm font-medium"
            style={{ color: "#4CA048" }}
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f4f5f5" }}>
                {["Service", "Provider", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ca3a7" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((r, i) => (
                <tr key={r.service} style={i % 2 === 1 ? { background: "#f4f5f5" } : {}}>
                  <td className="px-6 py-3 text-sm font-medium" style={{ color: "#272c2f" }}>{r.service}</td>
                  <td className="px-6 py-3 text-sm" style={{ color: "#9ca3a7" }}>{r.provider}</td>
                  <td className="px-6 py-3 text-sm" style={{ color: "#9ca3a7" }}>{r.date}</td>
                  <td className="px-6 py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={statusColors[r.status]}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Manage Services",   href: "/dashboard/services",  icon: "solar:briefcase-bold-duotone" },
          { label: "View All Bookings", href: "/dashboard/jobs",       icon: "solar:clipboard-list-bold-duotone" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-2xl p-5 flex items-center gap-4 transition-all"
            style={{ background: "#fff", border: "1px solid #dfe2e3" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4CA048"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#dfe2e3"; }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#eef8ed" }}>
              <Icon icon={action.icon} style={{ fontSize: 22, color: "#4CA048" }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: "#272c2f" }}>{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
