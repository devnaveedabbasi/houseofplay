'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '@/store/authSlice';
import { Icon } from '@iconify/react';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import UserDashboard from '@/components/dashboard/UserDashboard';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  if (loading || !user) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="eos-icons:loading" style={{ fontSize: 40, color: "#4CA048" }} />
          <p className="text-sm" style={{ color: "#9ca3a7" }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard user={user} />;
    case 'manager':
      return <ManagerDashboard user={user} />;
    default:
      return <UserDashboard user={user} />;
  }
}
