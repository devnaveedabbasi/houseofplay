'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '@/store/authSlice';
import { Icon } from '@iconify/react';
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

  // Redirect logic
  useEffect(() => {
    if (!isInitializing && !loading) {
      if (isAuthenticated && user) {
        router.replace('/dashboard/products');
      } else if (!isAuthenticated && !user) {
        router.replace('/auth/login');
      }
    }
  }, [loading, isAuthenticated, user, router, isInitializing]);

  //  Loading state
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

  if (!isAuthenticated || !user) {
    return null;
  }


}