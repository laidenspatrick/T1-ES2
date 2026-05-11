import React, { useState } from 'react';
import { TextField, Button, Box, Link, Typography } from '@mui/material';
import AuthCard from '../components/AuthCard';
import AlertMessage from '../components/AlertMessage';
import { api } from '../services/api';

interface RegisterPageProps {
  onRegister?: () => void;
  onNavigateLogin?: () => void;
}

export default function RegisterPage({ onRegister, onNavigateLogin }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await api.register({ name, email, password });
      setSuccess('Conta criada com sucesso! Faça login para continuar.');
      setName('');
      setEmail('');
      setPassword('');
      setTimeout(() => onRegister?.(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Criar Conta">
      <AlertMessage message={error} />
      <AlertMessage message={success} severity="success" />
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          margin="normal"
          autoComplete="name"
          data-testid="name-input"
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          margin="normal"
          autoComplete="email"
          data-testid="email-input"
        />
        <TextField
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          margin="normal"
          autoComplete="new-password"
          helperText="Mínimo de 6 caracteres"
          data-testid="password-input"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mt: 2, mb: 1, py: 1.5 }}
          data-testid="register-button"
        >
          {loading ? 'Criando conta...' : 'Criar Conta'}
        </Button>
        {onNavigateLogin && (
          <Typography variant="body2" align="center">
            Já tem conta?{' '}
            <Link component="button" type="button" onClick={onNavigateLogin} sx={{ cursor: 'pointer' }}>
              Fazer login
            </Link>
          </Typography>
        )}
      </Box>
    </AuthCard>
  );
}