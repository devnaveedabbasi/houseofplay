'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, LogOut, User, Menu, Settings } from 'lucide-react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { logout, fetchCurrentUser } from '@/store/authSlice';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    const result = await dispatch(logout());
    if (logout.fulfilled.match(result)) {
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } else {
      toast.error('Logout failed');
    }
  };

  const getInitials = () => {
    if (user?.fullName) return user.fullName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const displayName = user?.fullName || user?.name || 'User';
  const userEmail = user?.email || '';

  const roleBadge = {
    admin:   { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Admin' },
    manager: { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Manager' },
    user:    { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'User' },
  }[user?.role] ?? { bg: 'bg-gray-100', text: 'text-gray-600', label: 'User' };

  return (
    <header className="h-14 flex items-center justify-between px-4 sm:px-6
      bg-primary-600 border-b border-primary-500
      fixed top-0 right-0 left-0 lg:left-56 z-10">

      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-primary-200 hover:bg-primary-500 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Right side */}
      <div className="ml-auto" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen((p) => !p)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg
            hover:bg-primary-500 transition-colors"
        >
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-secondary-400 flex items-center
            justify-center text-xs font-semibold text-white flex-shrink-0">
            {getInitials()}
          </div>

          {/* Name + role */}
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-white leading-none">
              {displayName}
            </p>
            <p className="text-xs text-primary-200 leading-none mt-0.5 capitalize">
              {user?.role || 'user'}
            </p>
          </div>

          <ChevronDown
            size={14}
            className={`text-primary-200 transition-transform duration-200
              ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute right-4 mt-2 w-52 bg-white rounded-xl
            border border-secondary-200 shadow-sm py-1 z-20">

            {/* User info header */}
            <div className="px-4 py-2.5 border-b border-secondary-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-secondary-400 flex items-center
                  justify-center text-xs font-semibold text-white flex-shrink-0">
                  {getInitials()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-secondary-800 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-secondary-400 truncate">{userEmail}</p>
                </div>
              </div>
              {/* Role badge */}
              <span className={`mt-2 inline-block text-xs font-medium px-2 py-0.5
                rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                {roleBadge.label}
              </span>
            </div>

            {/* Links */}
            <Link
              href="/dashboard/profile"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm
                text-secondary-700 hover:bg-secondary-50 transition-colors"
            >
              <User size={14} className="text-secondary-400" />
              Profile
            </Link>

            <Link
              href="/dashboard/settings"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm
                text-secondary-700 hover:bg-secondary-50 transition-colors"
            >
              <Settings size={14} className="text-secondary-400" />
              Settings
            </Link>

            <div className="border-t border-secondary-100 my-1" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm
                text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <LogOut size={14} />
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}