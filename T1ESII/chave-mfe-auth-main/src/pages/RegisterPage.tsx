import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Box, Card, Typography, TextField, Button, Link } from '@mui/material';
import { api } from '../services/api';
import AlertMessage from '../components/AlertMessage';

type RegisterForm = { name: string; email: string; password: string };

export default function RegisterPage({ onRegistered }: { onRegistered?: () => void }) {
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<RegisterForm>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null);
    try {
      await api.register(data);
      setSuccess(true);
      setTimeout(() => onRegistered?.(), 1500);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro ao registrar');
    }
  };

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'grey.100' }}
    >
      <Card sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" component="h2" align="center" gutterBottom fontWeight="bold">
          Chave — Cadastro
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="name"
            control={control}
            defaultValue=""
            rules={{
              required: 'Nome é obrigatório',
              minLength: { value: 2, message: 'Nome deve ter ao menos 2 caracteres' },
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                data-testid="name-input"
                fullWidth
                label="Nome completo"
                margin="normal"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
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
            rules={{
              required: 'Senha é obrigatória',
              minLength: { value: 6, message: 'Senha deve ter ao menos 6 caracteres' },
            }}
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
          <AlertMessage message={success ? 'Cadastro realizado! Redirecionando...' : null} severity="success" />
          <Button
            data-testid="register-button"
            fullWidth
            type="submit"
            variant="contained"
            color="success"
            disabled={isSubmitting || success}
            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </form>
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Link href="/login" underline="hover" color="success.main">
            Já possui conta? Entrar
          </Link>
        </Box>
      </Card>
    </Box>
  );
}
