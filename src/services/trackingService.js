/**
 * Client-Side Analytics & Tracking Service
 * Handles Google Analytics (GA4) and Microsoft Clarity integration with cookie consent respect
 */

const COOKIE_PREFERENCES_KEY = 'estatepro_cookie_preferences';

// Your Google Analytics Measurement ID (replace with your actual ID)
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Your Microsoft Clarity Project ID (replace with your actual ID)
const CLARITY_ID = import.meta.env.VITE_CLARITY_ID || '';

/**
 * Check if analytics cookies are allowed
 */
const isAnalyticsAllowed = () => {
  try {
    const prefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (!prefs) return false;
    const parsed = JSON.parse(prefs);
    return parsed.analytics === true;
  } catch {
    return false;
  }
};

/**
 * Initialize Microsoft Clarity
 * Provides session recordings and heatmaps
 */
export const initClarity = () => {
  if (!isAnalyticsAllowed()) return;
  if (typeof window === 'undefined') return;
  if (!CLARITY_ID || CLARITY_ID === '') return;
  if (window.clarity) {
    console.log('🔍 [Clarity] Already initialized');
    return;
  }

  console.log('🔍 [Clarity] Initializing Microsoft Clarity...');

  // Microsoft Clarity initialization script
  (function(c, l, a, r, i, t, y) {
    c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", CLARITY_ID);

  console.log('🔍 [Clarity] Initialized successfully');
};

/**
 * Initialize Google Analytics
 * Only loads the script if analytics consent is given
 */
export const initAnalytics = () => {
  if (!isAnalyticsAllowed()) {
    console.log('📊 [Analytics] Skipped - User has not consented to analytics cookies');
    return;
  }

  if (typeof window === 'undefined') return;

  // Initialize Google Analytics
  if (!window.gtag && GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    console.log('📊 [Analytics] Initializing Google Analytics...');

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true, // GDPR compliance
      cookie_flags: 'SameSite=None;Secure',
    });

    console.log('📊 [Analytics] Google Analytics initialized successfully');
  }

  // Also initialize Clarity
  initClarity();
};

/**
 * Track page view
 * @param {string} path - The page path
 * @param {string} title - The page title
 */
export const trackPageView = (path, title) => {
  if (!isAnalyticsAllowed() || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
  });

  console.log(`📊 [Analytics] Page view: ${path}`);
};

/**
 * Track custom event
 * @param {string} eventName - Name of the event
 * @param {Object} params - Event parameters
 */
export const trackEvent = (eventName, params = {}) => {
  if (!isAnalyticsAllowed() || !window.gtag) return;

  window.gtag('event', eventName, params);

  console.log(`📊 [Analytics] Event: ${eventName}`, params);
};

/**
 * Track user action events
 */
export const tracker = {
  // Search & Discovery
  searchPerformed: (query, resultsCount) => {
    trackEvent('search', {
      search_term: query,
      results_count: resultsCount,
    });
  },

  // Property Interactions
  propertyViewed: (propertyId, propertyName, propertyType) => {
    trackEvent('view_item', {
      item_id: propertyId,
      item_name: propertyName,
      item_category: propertyType,
    });
  },

  projectViewed: (projectId, projectName, location) => {
    trackEvent('view_item', {
      item_id: projectId,
      item_name: projectName,
      item_category: 'project',
      item_variant: location,
    });
  },

  unitViewed: (unitId, unitType, price, projectName) => {
    trackEvent('view_item', {
      item_id: unitId,
      item_category: unitType,
      price: price,
      item_brand: projectName,
    });
  },

  // Lead Generation
  contactFormSubmitted: (formType, subject) => {
    trackEvent('generate_lead', {
      form_type: formType,
      subject: subject,
    });
  },

  whatsAppClicked: (source, propertyId = null) => {
    trackEvent('contact', {
      method: 'whatsapp',
      source: source,
      item_id: propertyId,
    });
  },

  phoneCallClicked: (source, propertyId = null) => {
    trackEvent('contact', {
      method: 'phone',
      source: source,
      item_id: propertyId,
    });
  },

  // AI Chat
  aiChatStarted: () => {
    trackEvent('ai_chat_started');
  },

  aiQuerySent: (queryType, hasResults) => {
    trackEvent('ai_query', {
      query_type: queryType,
      has_results: hasResults,
    });
  },

  // User Engagement
  filterApplied: (filterType, filterValue) => {
    trackEvent('filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
    });
  },

  sortApplied: (sortType) => {
    trackEvent('sort_applied', {
      sort_type: sortType,
    });
  },

  shareClicked: (platform, itemType, itemId) => {
    trackEvent('share', {
      method: platform,
      content_type: itemType,
      item_id: itemId,
    });
  },

  // Conversion Events
  inquirySubmitted: (propertyId, propertyType, price) => {
    trackEvent('begin_checkout', {
      item_id: propertyId,
      item_category: propertyType,
      value: price,
      currency: 'EGP',
    });
  },

  scheduleTourRequested: (propertyId, tourDate) => {
    trackEvent('schedule_tour', {
      item_id: propertyId,
      tour_date: tourDate,
    });
  },
};

/**
 * Disable analytics (when user revokes consent)
 */
export const disableAnalytics = () => {
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
    });
    console.log('📊 [Analytics] Disabled by user');
  }
};

/**
 * Listen for cookie consent changes
 */
if (typeof window !== 'undefined') {
  window.addEventListener('cookieConsentUpdated', (e) => {
    const prefs = e.detail;
    if (prefs.analytics) {
      initAnalytics();
    } else {
      disableAnalytics();
    }
  });
}

export default tracker;
