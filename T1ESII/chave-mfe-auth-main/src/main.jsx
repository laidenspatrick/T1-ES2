import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
  },
  shape: { borderRadius: 8 },
});

type Screen = 'login' | 'register' | 'account';

function App() {
  const [screen, setScreen] = useState<Screen>(() =>
    localStorage.getItem('access_token') ? 'account' : 'login'
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {screen === 'login' && (
        <LoginPage
          onLogin={() => setScreen('account')}
          onNavigateRegister={() => setScreen('register')}
        />
      )}
      {screen === 'register' && (
        <RegisterPage
          onRegister={() => setScreen('login')}
          onNavigateLogin={() => setScreen('login')}
        />
      )}
      {screen === 'account' && (
        <AccountPage onLogout={() => setScreen('login')} />
      )}
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);