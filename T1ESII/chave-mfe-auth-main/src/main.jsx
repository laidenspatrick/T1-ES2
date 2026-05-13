import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import AccountPage from './pages/AccountPage.tsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';

// Tema acessível: fonte base 16px (público idoso), contraste AA
const theme = createTheme({
  typography: {
    fontSize: 16,
  },
  palette: {
    primary: { main: '#1565c0' },
  },
  shape: { borderRadius: 8 },
});

type Screen = 'login' | 'register' | 'account' | 'forgot-password';

function App() {
  const [screen, setScreen] = useState<Screen>(() =>
    localStorage.getItem('access_token') ? 'account' : 'login',
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {screen === 'login' && (
        <LoginPage onLogin={() => setScreen('account')} />
      )}
      {screen === 'register' && (
        <RegisterPage onRegistered={() => setScreen('login')} />
      )}
      {screen === 'account' && (
        <AccountPage onLogout={() => setScreen('login')} />
      )}
      {screen === 'forgot-password' && (
        <ForgotPasswordPage />
      )}
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
