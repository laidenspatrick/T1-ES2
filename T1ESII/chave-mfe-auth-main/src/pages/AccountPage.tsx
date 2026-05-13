import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { api, clearTokens } from '../services/api';
import { UserPublic } from '../types';
import AlertMessage from '../components/AlertMessage';

interface AccountPageProps {
  onLogout?: () => void;
}

export default function AccountPage({ onLogout }: AccountPageProps) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then(setUser)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar dados'))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // ignora erro de logout no server; limpa tokens local de qualquer forma
    }
    clearTokens();
    onLogout?.();
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 480, width: '100%', borderRadius: 3, boxShadow: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                borderRadius: '50%',
                p: 1.5,
                display: 'flex',
              }}
            >
              <PersonIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Minha Conta
            </Typography>
          </Box>

          <AlertMessage message={error} />

          {user && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Nome
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {user.name}
                </Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Perfil
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={user.role}
                    color={user.role === 'ADMIN' ? 'error' : 'primary'}
                    size="small"
                  />
                </Box>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Membro desde
                </Typography>
                <Typography variant="body1">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>
            </>
          )}

          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            size="large"
            data-testid="logout-button"
          >
            Sair
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}