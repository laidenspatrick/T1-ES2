import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import LoginPage from '../pages/LoginPage';

vi.mock('../services/api', () => ({
  api: { login: vi.fn() },
  saveTokens: vi.fn(),
}));

import { api, saveTokens } from '../services/api';

const mockApi = api as { login: ReturnType<typeof vi.fn> };
const mockSaveTokens = saveTokens as ReturnType<typeof vi.fn>;

const theme = createTheme();

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza campos de email e senha', () => {
    renderWithTheme(<LoginPage />);
    expect(screen.getByTestId('email-input')).toBeTruthy();
    expect(screen.getByTestId('password-input')).toBeTruthy();
    expect(screen.getByTestId('login-button')).toBeTruthy();
  });

  it('chama onLogin após submit válido', async () => {
    mockApi.login.mockResolvedValue({ access_token: 'tok', refresh_token: 'ref' });
    const onLogin = vi.fn();
    renderWithTheme(<LoginPage onLogin={onLogin} />);

    fireEvent.change(screen.getByTestId('email-input').querySelector('input')!, {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByTestId('password-input').querySelector('input')!, {
      target: { value: 'senha123' },
    });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalled();
      expect(mockSaveTokens).toHaveBeenCalledWith('tok', 'ref');
    });
  });

  it('exibe mensagem de erro em falha de login', async () => {
    mockApi.login.mockRejectedValue(new Error('Credenciais inválidas'));
    renderWithTheme(<LoginPage />);

    fireEvent.change(screen.getByTestId('email-input').querySelector('input')!, {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByTestId('password-input').querySelector('input')!, {
      target: { value: 'senhaerrada' },
    });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeTruthy();
    });
  });
});
