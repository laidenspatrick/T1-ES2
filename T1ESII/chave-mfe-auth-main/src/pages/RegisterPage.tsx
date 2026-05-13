import { useState } from "react";
import { Box, Card, Typography, TextField, Button, Link } from "@mui/material";

const API = import.meta.env.VITE_MS_AUTH_URL || "http://localhost:3001";

export default function RegisterPage({ onRegistered }: { onRegistered?: (data: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg || "Erro ao registrar");
      }

      const data = await res.json();
      onRegistered?.(data);

      alert("Cadastro realizado com sucesso!");
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "grey.100" }}>
      <Card sx={{ p: 4, width: "100%", maxWidth: 380, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" component="h2" align="center" gutterBottom color="text.primary" sx={{ fontWeight: "bold" }}>
          Chave — Cadastro
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Senha"
            type="password"
            placeholder="Crie uma senha segura"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="success"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
        <Box sx={{ textAlign: "center", mt: 1 }}>
          <Link href="/login" underline="hover" color="success.main">
            Já possui conta? Entrar
          </Link>
        </Box>
      </Card>
    </Box>
  );
}
