"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

const stats = [
  { label: "Total Users",    value: "2,847",  change: "+12%", icon: "solar:users-group-two-rounded-bold-duotone", color: "#4CA048", bg: "#eef8ed" },
  { label: "Active Services",value: "184",    change: "+8%",  icon: "solar:briefcase-bold-duotone",               color: "#4CA048", bg: "#eef8ed" },
  { label: "Total Revenue",  value: "$48,210",change: "+21%", icon: "solar:wallet-money-bold-duotone",            color: "#383F43", bg: "#f4f5f5" },
  { label: "Pending Jobs",   value: "63",     change: "-4%",  icon: "solar:clipboard-list-bold-duotone",          color: "#e07b39", bg: "#fff5ed" },
];

const recentUsers = [
  { name: "Ahmad Khan",    email: "ahmad@email.com",  role: "user",     status: "active" },
  { name: "Sara Malik",    email: "sara@email.com",   role: "provider", status: "active" },
  { name: "Bilal Raza",    email: "bilal@email.com",  role: "user",     status: "pending" },
  { name: "Nadia Ahmed",   email: "nadia@email.com",  role: "manager",  status: "active" },
  { name: "Usman Tariq",   email: "usman@email.com",  role: "user",     status: "inactive" },
];

const statusColors = {
  active:   { bg: "#eef8ed", color: "#4CA048" },
  pending:  { bg: "#fff8ed", color: "#e07b39" },
  inactive: { bg: "#f4f5f5", color: "#9ca3a7" },
};

export default function AdminDashboard({ user }) {
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div
        className="rounded-2xl p-6 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #1f2325 0%, #272c2f 100%)", border: "1px solid #2f3539" }}
      >
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "#4CA048" }}>
            Welcome back 👋
          </p>
          <h1 className="text-2xl font-bold text-white">
            {user?.fullName || "Administrator"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#9ca3a7" }}>
            Here&apos;s what&apos;s happening across your platform today.
          </p>
        </div>
        <div
          className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl"
          style={{ background: "#4CA048" }}
        >
          <Icon icon="solar:shield-star-bold-duotone" className="text-3xl text-white" />
        </div>
      </div>

      {/* Stats grid */}
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
              <p className="text-2xl font-bold" style={{ color: "#141718" }}>
                {s.value}
              </p>
              <p className="text-sm" style={{ color: "#9ca3a7" }}>
                {s.label}
              </p>
            </div>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
              style={
                s.change.startsWith("+")
                  ? { background: "#eef8ed", color: "#4CA048" }
                  : { background: "#fff5ed", color: "#e07b39" }
              }
            >
              {s.change} this month
            </span>
          </div>
        ))}
      </div>

      {/* Recent users table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #dfe2e3" }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid #dfe2e3" }}
        >
          <h2 className="text-base font-bold" style={{ color: "#141718" }}>
            Recent Users
          </h2>
          <Link
            href="/dashboard/users"
            className="text-sm font-medium transition-colors"
            style={{ color: "#4CA048" }}
          >
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f4f5f5" }}>
                {["Name", "Email", "Role", "Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#9ca3a7" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u, i) => (
                <tr
                  key={u.email}
                  style={i % 2 === 1 ? { background: "#f4f5f5" } : {}}
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: "#eef8ed", color: "#4CA048" }}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium" style={{ color: "#272c2f" }}>
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm" style={{ color: "#9ca3a7" }}>
                    {u.email}
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm capitalize" style={{ color: "#6f787d" }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                      style={statusColors[u.status]}
                    >
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Manage Users",     href: "/dashboard/users",     icon: "solar:users-group-two-rounded-bold-duotone" },
          { label: "View Payments",    href: "/dashboard/payments",  icon: "solar:card-bold-duotone" },
          { label: "Content & Banners",href: "/dashboard/banners",   icon: "solar:gallery-wide-bold-duotone" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 group"
            style={{ background: "#fff", border: "1px solid #dfe2e3" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4CA048"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#dfe2e3"; }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: "#eef8ed" }}
            >
              <Icon icon={action.icon} style={{ fontSize: 22, color: "#4CA048" }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: "#272c2f" }}>
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
