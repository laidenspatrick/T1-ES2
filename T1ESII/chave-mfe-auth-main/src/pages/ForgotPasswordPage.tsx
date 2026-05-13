import { useState } from 'react';
import { Box, Card, Typography, TextField, Button, Link } from '@mui/material';
import AlertMessage from '../components/AlertMessage';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'grey.100' }}
    >
      <Card sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" component="h2" align="center" gutterBottom fontWeight="bold">
          Recuperar Senha
        </Typography>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Digite seu e-mail e enviaremos instruções para redefinir sua senha.
            </Typography>
            <TextField
              fullWidth
              label="E-mail"
              type="email"
              margin="normal"
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
            >
              Enviar instruções
            </Button>
          </form>
        ) : (
          <AlertMessage
            message="Se o e-mail estiver cadastrado, você receberá as instruções em breve."
            severity="success"
          />
        )}

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Link href="/login" underline="hover" color="primary">
            Voltar ao login
          </Link>
        </Box>
      </Card>
    </Box>
  );
}
