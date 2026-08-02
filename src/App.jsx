import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './store/appStore'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Prospects from './pages/Prospects'
import Settings from './pages/Settings'
import Login from './pages/Login'

export default function App() {
  // Force clear SW cache for development updates
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }

  const { user, authLoading, dataLoading } = useApp()

  if (authLoading || (user && dataLoading)) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#051417', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(82, 183, 136, 0.2)', borderTopColor: '#52b788', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="prospects" element={<Prospects />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
