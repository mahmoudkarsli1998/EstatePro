import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PublicLayout from './components/public/Layout';
import DashboardLayout from './components/dashboard/Layout';
const Home = React.lazy(() => import('./pages/public/Home'));
const ProjectsList = React.lazy(() => import('./pages/public/ProjectsList'));
const ProjectDetail = React.lazy(() => import('./pages/public/ProjectDetail'));
const UnitDetail = React.lazy(() => import('./pages/public/UnitDetail'));
const About = React.lazy(() => import('./pages/public/About'));
const Contact = React.lazy(() => import('./pages/public/Contact'));
const Locations = React.lazy(() => import('./pages/public/Locations'));
const DesignStudio = React.lazy(() => import('./pages/public/DesignStudio'));
const Sell = React.lazy(() => import('./pages/public/Sell'));
const PublicDevelopers = React.lazy(() => import('./pages/public/Developers'));
const UnitsList = React.lazy(() => import('./pages/public/UnitsList'));
const DeveloperDetail = React.lazy(() => import('./pages/public/DeveloperDetail'));
const AiAssistantPage = React.lazy(() => import('./pages/public/AiAssistantPage'));


const InviteAccept = React.lazy(() => import('./pages/dashboard/InviteAccept'));
const Login = React.lazy(() => import('./pages/dashboard/Login'));
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const Projects = React.lazy(() => import('./pages/dashboard/Projects'));
const Units = React.lazy(() => import('./pages/dashboard/Units'));
const AddUnit = React.lazy(() => import('./pages/dashboard/AddUnit'));
const Leads = React.lazy(() => import('./pages/dashboard/Leads'));
const Users = React.lazy(() => import('./pages/dashboard/Users'));
const DashboardLocations = React.lazy(() => import('./pages/dashboard/Locations'));
const Developers = React.lazy(() => import('./pages/dashboard/Developers'));
const Managers = React.lazy(() => import('./pages/dashboard/Managers'));
const Admins = React.lazy(() => import('./pages/dashboard/Admins'));
const Agents = React.lazy(() => import('./pages/dashboard/Agents'));
const Calendar = React.lazy(() => import('./pages/dashboard/Calendar'));
const Analysis = React.lazy(() => import('./pages/dashboard/Analysis'));
const Reports = React.lazy(() => import('./pages/dashboard/Reports'));
const AiSettings = React.lazy(() => import('./pages/dashboard/AiSettings'));
const Profile = React.lazy(() => import('./pages/dashboard/Profile'));
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './hooks/useAuth';
import PageLoader from './components/shared/PageLoader';
import Particles from './components/shared/Particles';

import Preloader from './components/shared/Preloader';
import RequireAuth from './components/auth/RequireAuth';
import ScrollToTop from './components/shared/ScrollToTop';
import CookieConsentBanner from './components/shared/CookieConsentBanner';
import usePageTracking from './hooks/usePageTracking';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Particles />
        <AnimatePresence mode="wait">
          {loading && <Preloader onComplete={() => setLoading(false)} />}
        </AnimatePresence>
        
        {!loading && (
          <Router>
            <AnimatedRoutes />
            <CookieConsentBanner />
          </Router>
        )}
      </AuthProvider>
    </ThemeProvider>
  );
}

const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Initialize analytics and track page views
  usePageTracking();
  
  return (
    <AnimatePresence mode="wait">
      <React.Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route element={<><ScrollToTop /><PublicLayout /></>}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/units/:id" element={<UnitDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/design" element={<DesignStudio />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/developers" element={<PublicDevelopers />} />
            <Route path="/developers" element={<PublicDevelopers />} />
            <Route path="/developers/:id" element={<DeveloperDetail />} />
            <Route path="/units" element={<UnitsList />} />
          </Route>

          {/* Standalone AI Assistant (No Navbar/Footer) */}
          <Route path="/ai-assistant" element={<AiAssistantPage />} />


          {/* Dashboard Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/invite-accept" element={<InviteAccept />} />
          <Route path="/dashboard" element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            
            {/* Admin & Manager Routes */}
            <Route element={<RequireAuth allowedRoles={['admin', 'manager']}><Outlet /></RequireAuth>}>
              <Route path="projects" element={<Projects />} />
              <Route path="locations" element={<DashboardLocations />} />
              <Route path="users" element={<Users />} />
              <Route path="managers" element={<Managers />} />
              <Route path="admins" element={<Admins />} />
              <Route path="developers" element={<Developers />} />
              <Route path="agents" element={<Agents />} />
              <Route path="analysis" element={<Analysis />} />
              <Route path="reports" element={<Reports />} />
              <Route path="ai-settings" element={<AiSettings />} />
            </Route>

            {/* Shared Routes (with internal restrictions) */}
            <Route path="leads" element={<RequireAuth allowedRoles={['admin', 'manager', 'sales']}><Leads /></RequireAuth>} />
            <Route path="calendar" element={<RequireAuth allowedRoles={['admin', 'manager', 'sales', 'agent']}><Calendar /></RequireAuth>} />
            <Route path="units" element={<Units />} />
            <Route path="units/add" element={<AddUnit />} />
            <Route path="units/edit/:id" element={<AddUnit />} />
          </Route>
        </Routes>
      </React.Suspense>
    </AnimatePresence>
  );
};


export default App;
