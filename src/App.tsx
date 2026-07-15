import { Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from '@components/layout/AppShell';
import { ROUTES } from '@config/routes';
import NotFoundPage from '@pages/NotFoundPage';

// Declares the router from the shared ROUTES source of truth and renders every
// page inside the persistent AppShell. The active route's label drives the
// document title via the AppShell pageTitle prop.
function App() {
  const location = useLocation();
  const activeRoute = ROUTES.find((route) => route.path === location.pathname);
  const pageTitle = activeRoute?.label ?? 'Not found';

  return (
    <AppShell pageTitle={pageTitle}>
      <Routes>
        {ROUTES.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
