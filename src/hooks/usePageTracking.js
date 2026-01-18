import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from '../services/trackingService';

/**
 * Hook to automatically track page views on route changes
 * Place this in App.jsx or a layout component
 */
const usePageTracking = () => {
  const location = useLocation();

  // Initialize analytics on mount (respects cookie consent)
  useEffect(() => {
    initAnalytics();
  }, []);

  // Track page views on route change
  useEffect(() => {
    // Small delay to ensure page title has updated
    const timer = setTimeout(() => {
      trackPageView(location.pathname, document.title);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);
};

export default usePageTracking;
