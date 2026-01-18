import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import './i18n';
import { ToastProvider } from './context/ToastContext.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import { NotificationsProvider } from './context/NotificationsContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CurrencyProvider defaultCurrency="EGP">
      <ToastProvider>
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </ToastProvider>
    </CurrencyProvider>
  </StrictMode>,
);

