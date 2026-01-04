import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import SalesDashboard from './SalesDashboard';
import PageLoader from '../../components/shared/PageLoader';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  // Debug log to ensure role is detected
  console.log('Dashboard Dispatcher - User Role:', user?.role);

  if (user?.role?.toLowerCase() === 'sales') {
    return <SalesDashboard />;
  }

  // Default to Admin/Manager dashboard for other roles
  return <AdminDashboard />;
};

export default Dashboard;
