import { Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from '@components/layout/AppShell';
import { RouteErrorBoundary } from '@components/RouteErrorBoundary';
import { RouteFallback } from '@components/RouteFallback';
import { ROUTES } from '@config/routes';
import NotFoundPage from '@pages/NotFoundPage';

// Declares the router from the shared ROUTES source of truth and renders every
// page inside the persistent AppShell. The active route's label drives the
// document title via the AppShell pageTitle prop. Pages are code-split via
// React.lazy (see routes.ts), so the routes are wrapped in a Suspense boundary
// that shows an accessible loading fallback while a page chunk resolves, and an
// error boundary that renders an accessible error state if a chunk fails to load.
function App() {
  const location = useLocation();
  const activeRoute = ROUTES.find((route) => route.path === location.pathname);
  const pageTitle = activeRoute?.label ?? 'Not found';

  return (
    <AppShell pageTitle={pageTitle}>
      <RouteErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {ROUTES.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </AppShell>
  );
}

export default App;
