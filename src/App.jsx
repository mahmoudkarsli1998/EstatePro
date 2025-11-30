import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PublicLayout from './components/public/Layout';
import DashboardLayout from './components/dashboard/Layout';
import Home from './pages/public/Home';
import ProjectsList from './pages/public/ProjectsList';
import ProjectDetail from './pages/public/ProjectDetail';
import UnitDetail from './pages/public/UnitDetail';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Locations from './pages/public/Locations';
import DesignStudio from './pages/public/DesignStudio';
import Login from './pages/dashboard/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Projects from './pages/dashboard/Projects';
import Units from './pages/dashboard/Units';
import Leads from './pages/dashboard/Leads';
import Users from './pages/dashboard/Users';
import Reports from './pages/dashboard/Reports';
import { ThemeProvider } from './context/ThemeContext';
import Particles from './components/shared/Particles';
import Preloader from './components/shared/Preloader';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <ThemeProvider>
      <Particles />
      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      
      {!loading && (
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<ProjectsList />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/units/:id" element={<UnitDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/design" element={<DesignStudio />} />
            </Route>

            {/* Dashboard Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="units" element={<Units />} />
              <Route path="leads" element={<Leads />} />
              <Route path="users" element={<Users />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Routes>
        </Router>
      )}
    </ThemeProvider>
  );
}

export default App;
