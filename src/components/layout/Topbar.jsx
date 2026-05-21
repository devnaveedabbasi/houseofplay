"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, LogOut, User, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { logout, fetchCurrentUser } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Topbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading } = useSelector((state) => state.auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    const resultAction = await dispatch(logout());
    if (logout.fulfilled.match(resultAction)) {
      toast.success("Logged out successfully");
      router.push("/auth/login");
    } else {
      toast.error("Logout failed");
    }
  };

  const getInitials = () => {
    if (user?.fullName) return user.fullName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const displayName = user?.fullName || user?.name || "User";
  const userEmail   = user?.email || "";

  const roleBadgeColor = {
    admin:   { bg: "#1a2e1a", color: "#4CA048", label: "Admin" },
    manager: { bg: "#1a2228", color: "#67b8c8", label: "Manager" },
    user:    { bg: "#1f2325", color: "#9ca3a7", label: "User" },
  }[user?.role] || { bg: "#1f2325", color: "#9ca3a7", label: "User" };

  return (
    <header
      className="h-16 flex items-center justify-between px-4 border-b border-secondary-300 bg-primary-600 sm:px-6 fixed top-0 right-0 left-0 lg:left-56 z-10"
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg transition-colors"
        style={{ color: "#6f787d" }}
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications bell */}
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: "#6f787d" }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "#4CA048" }}
          />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 sm:gap-3 px-2 py-1.5 rounded-xl transition-colors"
            style={{ background: isDropdownOpen ? "#f4f5f5" : "transparent" }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: "#4CA048", color: "#fff" }}
            >
              {getInitials()}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold leading-tight" style={{ color: "#272c2f" }}>
                {displayName}
              </p>
              <p className="text-xs leading-tight capitalize" style={{ color: "#9ca3a7" }}>
                {user?.role || "User"}
              </p>
            </div>

            <ChevronDown
              size={15}
              className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              style={{ color: "#9ca3a7" }}
            />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-1 z-20"
              style={{ background: "#fff", border: "1px solid #dfe2e3" }}
            >
              {/* User info */}
              <div className="px-4 py-3" style={{ borderBottom: "1px solid #dfe2e3" }}>
                <p className="text-sm font-semibold" style={{ color: "#272c2f" }}>
                  {displayName}
                </p>
                <p className="text-xs truncate" style={{ color: "#9ca3a7" }}>
                  {userEmail}
                </p>
              </div>

              <Link
                href="/dashboard/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                style={{ color: "#383F43" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f4f5f5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
              >
                <User size={15} />
                Profile
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                style={{ color: "#383F43" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f4f5f5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
              >
                <Settings size={15} />
                Settings
              </Link>

              <div style={{ borderTop: "1px solid #dfe2e3", margin: "4px 0" }} />

              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                style={{ color: "#e53e3e" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#fff5f5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
              >
                <LogOut size={15} />
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}