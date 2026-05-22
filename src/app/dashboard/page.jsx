'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '@/store/authSlice';
import { Icon } from '@iconify/react';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import UserDashboard from '@/components/dashboard/UserDashboard';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (!token && !isAuthenticated) {
      router.replace('/auth/login');
    } else if (token && !isAuthenticated) {
      dispatch(fetchCurrentUser()).finally(() => {
        setIsInitializing(false);
      });
    } else {
      setIsInitializing(false);
    }
  }, [dispatch, isAuthenticated, router]);

  // ✅ Agar loading khatam ho gayi aur authenticated nahi hai toh login pe bhejo
  useEffect(() => {
    if (!isInitializing && !loading && !isAuthenticated && !user) {
      router.replace('/auth/login');
    }
  }, [loading, isAuthenticated, user, router, isInitializing]);

  // ✅ Loading state
  if (loading || isInitializing) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="eos-icons:loading" style={{ fontSize: 40, color: "#4CA048" }} />
          <p className="text-sm" style={{ color: "#9ca3a7" }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ✅ Na authenticated, na user — redirect ho raha hai, kuch mat dikhao
  if (!isAuthenticated || !user) {
    return null;
  }

  // ✅ Role ke hisaab se dashboard dikhao
  switch (user.role) {
    case 'admin':
      return <AdminDashboard user={user} />;
    case 'manager':
      return <ManagerDashboard user={user} />;
    default:
      return <UserDashboard user={user} />;
  }
}