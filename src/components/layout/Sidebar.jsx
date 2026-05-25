"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Users,
  FileText,
  ChevronDown,
  X,
  Settings,
  BarChart2,
  Download,
  Upload,
  Package,
  Truck,
  UserCog,
} from "lucide-react";
import { useSelector } from "react-redux";

// same baseNav (unchanged)
const baseNav = [
  {
    groupLabel: "CSV Management",
    groupIcon: FileText,
    items: [
      { name: "Export CSV", href: "/dashboard/export-csv", icon: Download },
      { name: "Import CSV", href: "/dashboard/import-csv", icon: Upload },
    ],
  },
  {
    groupLabel: "Products",
    groupIcon: Package,
    items: [
      { name: "All Products", href: "/dashboard/products", icon: Package },
      { name: "Estimate", href: "/dashboard/estimates", icon: Package },
      { name: "Add Raw", href: "/dashboard/products/add-raw", icon: Package },
      { name: "Add Theme", href: "/dashboard/products/add-theme", icon: Package },
      { name: "Variants", href: "/dashboard/products/variants", icon: Package },
      { name: "Add Manufactured", href: "/dashboard/products/add-manufactured", icon: Package },
      { name: "Add Composite", href: "/dashboard/products/add-composite", icon: Package },
      { name: "Add External", href: "/dashboard/products/add-external", icon: Package },
    ],
  },
  {
    groupLabel: "Management",
    groupIcon: Users,
    items: [
      { name: "Supplier Management", href: "/dashboard/suppliers", icon: Truck },
      { name: "User Management", href: "/dashboard/users", icon: Users },
      { name: "Dummy Users", href: "/dashboard/dummy-users", icon: UserCog },
    ],
  },
  {
    groupLabel: "Reports & Settings",
    groupIcon: Settings,
    items: [
      { name: "Reports", href: "/dashboard/reports", icon: BarChart2 },
      { name: "Platform Settings", href: "/dashboard/platform-settings", icon: Settings },
      { name: "Change Password", href: "/dashboard/change-password", icon: UserCog },
    ],
  },
];

const navConfig = {
  admin: baseNav,
  manager: baseNav,
  user: baseNav,
};

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);

  const role = user?.role || "user";
  const navGroups = navConfig[role];

  const [openGroups, setOpenGroups] = useState({});

  useEffect(() => {
    const initial = {};
    navGroups.forEach((g) => (initial[g.groupLabel] = true));
    setOpenGroups(initial);
  }, [role]);

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActive = (href) => pathname === href;

  const isGroupActive = (items) =>
    items?.some((item) => pathname === item.href);

  return (
    <aside
      className={`
        bg-primary-600 text-white
        w-56 flex flex-col fixed h-screen z-30
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* HEADER */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-secondary-300 flex-shrink-0">
        <Image src="/logo.png" alt="Logo" width={170} height={60} />

        <button onClick={onClose} className="lg:hidden">
          <X size={18} />
        </button>
      </div>

      {/* NAV */}
      <nav
        className="
          flex-1 px-3 py-4
          overflow-y-auto space-y-2
          scrollbar-hide
        "
      >
        {navGroups.map((group) => {
          const isOpen = openGroups[group.groupLabel];
          const groupActive = isGroupActive(group.items);
          const GroupIcon = group.groupIcon;

          return (
            <div key={group.groupLabel} className="w-full">
              {/* GROUP HEADER */}
              <button
                onClick={() => toggleGroup(group.groupLabel)}
                className={`
                  w-full flex items-center justify-between
                  px-3 py-2 rounded-xl
                  text-left   /* 🔥 FIX: LEFT ALIGN */
                  transition
                  ${
                    groupActive
                      ? "bg-[#1f2325] text-white"
                      : "text-gray-400 hover:text-white hover:bg-[#111415]"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <GroupIcon size={14} />
                  <span className="text-[12px] uppercase tracking-widest text-left">
                    {group.groupLabel}
                  </span>
                </div>

                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* ITEMS */}
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: isOpen ? `${group.items.length * 48}px` : "0px",
                }}
              >
                <div className="pl-2 pt-2 space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                          transition
                          ${
                            active
                              ? "bg-green-600 text-white"
                              : "text-gray-400 hover:bg-[#1f2325] hover:text-white"
                          }
                        `}
                      >
                        <Icon size={15} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* USER */}
      {user && (
        <div className="px-4 py-3 border-t border-secondary-300 flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            {(user.fullName || user.email)?.charAt(0).toUpperCase()}
          </div>

          <div className="overflow-hidden">
            <p className="text-sm truncate">{user.fullName}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      )}

    
    </aside>
  );
}