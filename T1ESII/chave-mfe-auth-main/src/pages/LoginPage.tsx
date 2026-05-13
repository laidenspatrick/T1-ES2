import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Box, Card, Typography, TextField, Button, Link } from '@mui/material';
import { api, saveTokens } from '../services/api';
import AlertMessage from '../components/AlertMessage';

type LoginForm = { email: string; password: string };

export default function LoginPage({ onLogin }: { onLogin?: () => void }) {
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginForm>();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      const tokens = await api.login(data);
      saveTokens(tokens.access_token, tokens.refresh_token);
      onLogin?.();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro ao fazer login');
    }
  };

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'grey.100' }}
    >
      <Card sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" component="h2" align="center" gutterBottom fontWeight="bold">
          Chave — Entrar
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{
              required: 'E-mail é obrigatório',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' },
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                data-testid="email-input"
                fullWidth
                label="E-mail"
                type="email"
                margin="normal"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            defaultValue=""
            rules={{ required: 'Senha é obrigatória' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                data-testid="password-input"
                fullWidth
                label="Senha"
                type="password"
                margin="normal"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <AlertMessage message={serverError} severity="error" />
          <Button
            data-testid="login-button"
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Link href="/register" underline="hover" color="primary">
            Não possui conta? Cadastre-se
          </Link>
          <Box sx={{ mt: 1 }}>
            <Link href="/forgot-password" underline="hover" color="primary">
              Esqueci minha senha
            </Link>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
