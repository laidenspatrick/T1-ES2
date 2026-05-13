import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const LoginPage = lazy(() => import('mfe_auth/LoginPage'));
const RegisterPage = lazy(() => import('mfe_auth/RegisterPage'));
const AccountPage = lazy(() => import('mfe_auth/AccountPage'));

function PrivateRoute({ children }) {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<p>Carregando...</p>}>
        <Routes>
          <Route
            path="/login"
            element={
              <LoginPage onLogin={() => (window.location.href = '/home')} />
            }
          />
          <Route
            path="/register"
            element={
              <RegisterPage
                onRegistered={() => (window.location.href = '/login')}
              />
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <AccountPage onLogout={() => (window.location.href = '/login')} />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
