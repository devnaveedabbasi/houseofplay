"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  ChevronDown,
  X,
  Settings,
  BarChart2,
  CalendarCheck,
  Download,
  Upload,
  Package,
  Truck,
  UserCog,
} from "lucide-react";
import { useSelector } from "react-redux";

// ─── Navigation Config ───────────────────────────────────────────────────────

const navConfig = {
  admin: [
    {
      groupLabel: "CSV Management",
      groupIcon: FileText,
      items: [
        {
          name: "Export CSV",
          href: "/dashboard/export-csv",
          icon: Download,
        },
        {
          name: "Import CSV",
          href: "/dashboard/import-csv",
          icon: Upload,
        },
      ],
    },

    {
      groupLabel: "Products",
      groupIcon: Package,
      items: [
        {
          name: "All Products",
          href: "/dashboard/products",
          icon: Package,
        },
        {
          name: "Variants",
          href: "/dashboard/products/variants",
          icon: Package,
        },
        {
          name: "Categories",
          href: "/dashboard/products/categories",
          icon: Package,
        },
        {
          name: "Brands",
          href: "/dashboard/products/brands",
          icon: Package,
        },
        {
          name: "Stock Management",
          href: "/dashboard/products/stock",
          icon: Package,
        },
        {
          name: "Price List",
          href: "/dashboard/products/pricing",
          icon: Package,
        },
        {
          name: "Product Reviews",
          href: "/dashboard/products/reviews",
          icon: Package,
        },
      ],
    },

    {
      groupLabel: "Management",
      groupIcon: Users,
      items: [
        {
          name: "Supplier Management",
          href: "/dashboard/suppliers",
          icon: Truck,
        },
        {
          name: "User Management",
          href: "/dashboard/users",
          icon: Users,
        },
        {
          name: "Dummy Users",
          href: "/dashboard/dummy-users",
          icon: UserCog,
        },
      ],
    },

    {
      groupLabel: "Reports & Settings",
      groupIcon: Settings,
      items: [
        {
          name: "Reports",
          href: "/dashboard/reports",
          icon: BarChart2,
        },
        {
          name: "Platform Settings",
          href: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ],

  manager: [
    {
      groupLabel: "CSV Management",
      groupIcon: FileText,
      items: [
        {
          name: "Export CSV",
          href: "/dashboard/export-csv",
          icon: Download,
        },
        {
          name: "Import CSV",
          href: "/dashboard/import-csv",
          icon: Upload,
        },
      ],
    },

    {
      groupLabel: "Products",
      groupIcon: Package,
      items: [
        {
          name: "All Products",
          href: "/dashboard/products",
          icon: Package,
        },
        {
          name: "Variants",
          href: "/dashboard/products/variants",
          icon: Package,
        },
        {
          name: "Categories",
          href: "/dashboard/products/categories",
          icon: Package,
        },
        {
          name: "Stock Management",
          href: "/dashboard/products/stock",
          icon: Package,
        },
      ],
    },

    {
      groupLabel: "Management",
      groupIcon: Users,
      items: [
        {
          name: "Supplier Management",
          href: "/dashboard/suppliers",
          icon: Truck,
        },
      ],
    },

    {
      groupLabel: "Reports & Settings",
      groupIcon: Settings,
      items: [
        {
          name: "Reports",
          href: "/dashboard/reports",
          icon: BarChart2,
        },
        {
          name: "Platform Settings",
          href: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ],

  user: [
    {
      groupLabel: "My Account",
      groupIcon: UserCheck,
      items: [
        {
          name: "My Profile",
          href: "/dashboard/profile",
          icon: UserCheck,
        },
        {
          name: "My Orders",
          href: "/dashboard/my-orders",
          icon: FileText,
        },
      ],
    },

    {
      groupLabel: "Reports",
      groupIcon: BarChart2,
      items: [
        {
          name: "Reports",
          href: "/dashboard/reports",
          icon: BarChart2,
        },
      ],
    },
  ],
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);

  const role = user?.role || "user";

  const navGroups = navConfig[role] || navConfig.user;

  const [openGroups, setOpenGroups] = useState({});

  useEffect(() => {
    const initial = {};

    navGroups.forEach((g) => {
      initial[g.groupLabel] = true;
    });

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
        w-56 flex flex-col fixed h-full z-30
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between gap-2.5 px-5 border-b border-secondary-300 flex-shrink-0">
        <Image
          src="/logo.png"
          alt="Logo"
          width={220}
          height={120}
          className="object-contain"
        />

        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg"
        >
          <X size={18} />
        </button>
      </div>

      {/* Dashboard */}
      <div className="px-3 pt-1 pb-1 mt-4">
        <Link
          href="/dashboard"
          onClick={onClose}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
            pathname === "/dashboard"
              ? "bg-green-600 text-white font-semibold"
              : "text-gray-400 hover:bg-[#1f2325] hover:text-white"
          }`}
        >
          <LayoutDashboard size={17} />
          <span className="text-sm">Dashboard</span>
        </Link>
      </div>

      {/* Nav */}
      <nav
        className="flex-1 px-3 pb-4 overflow-y-auto space-y-1"
        style={{ scrollbarWidth: "none" }}
      >
        {navGroups.map((group) => {
          const isOpen = openGroups[group.groupLabel];

          const groupActive = isGroupActive(group.items);

          const GroupIcon = group.groupIcon;

          return (
            <div key={group.groupLabel}>
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.groupLabel)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 ${
                  groupActive
                    ? "text-white bg-[#1f2325]"
                    : "text-gray-400"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GroupIcon size={15} />

                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {group.groupLabel}
                  </span>
                </div>

                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Items */}
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: isOpen
                    ? `${group.items.length * 44}px`
                    : "0px",
                }}
              >
                <div className="pl-2 pt-1 space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href);

                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 text-sm ${
                          active
                            ? "bg-green-600 text-white font-semibold"
                            : "text-gray-400 hover:bg-[#1f2325] hover:text-white"
                        }`}
                      >
                        <Icon size={15} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Info */}
      {user && (
        <div className="px-4 py-3 flex items-center gap-3 border-t border-secondary-300">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold">
            {(user.fullName || user.email || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">
              {user.fullName || "User"}
            </p>

            <p className="text-xs text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}