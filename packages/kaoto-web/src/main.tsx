// Third-party imports
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { AppProvider } from './context/AppContext';
import { Router } from './routes';
// App level imports
import { initializeTheme } from './utils/theme';

const basename = import.meta.env.BASE_URL ?? '/';

// Initialize theme on client load
initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter basename={basename}>
          <Router />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  </StrictMode>,
);

// Remove visibility hidden after rendering to prevent FOUC
document.body.classList.add('ready');
