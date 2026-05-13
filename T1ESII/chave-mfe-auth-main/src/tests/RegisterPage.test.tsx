import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import RegisterPage from '../pages/RegisterPage';

vi.mock('../services/api', () => ({
  api: { register: vi.fn() },
}));

import { api } from '../services/api';

const mockApi = api as { register: ReturnType<typeof vi.fn> };

const theme = createTheme();

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza campos de nome, email e senha', () => {
    renderWithTheme(<RegisterPage />);
    expect(screen.getByTestId('name-input')).toBeTruthy();
    expect(screen.getByTestId('email-input')).toBeTruthy();
    expect(screen.getByTestId('password-input')).toBeTruthy();
    expect(screen.getByTestId('register-button')).toBeTruthy();
  });

  it('chama api.register com dados corretos no submit', async () => {
    mockApi.register.mockResolvedValue({
      id: 1, name: 'Maria Silva', email: 'm@test.com', role: 'user', created_at: '',
    });
    const onRegistered = vi.fn();
    renderWithTheme(<RegisterPage onRegistered={onRegistered} />);

    fireEvent.change(screen.getByTestId('name-input').querySelector('input')!, {
      target: { value: 'Maria Silva' },
    });
    fireEvent.change(screen.getByTestId('email-input').querySelector('input')!, {
      target: { value: 'm@test.com' },
    });
    fireEvent.change(screen.getByTestId('password-input').querySelector('input')!, {
      target: { value: 'senha123' },
    });
    fireEvent.click(screen.getByTestId('register-button'));

    await waitFor(() => {
      expect(mockApi.register).toHaveBeenCalledWith({
        name: 'Maria Silva',
        email: 'm@test.com',
        password: 'senha123',
      });
    });
  });

  it('exibe erro de servidor em falha de cadastro', async () => {
    mockApi.register.mockRejectedValue(new Error('E-mail já cadastrado'));
    renderWithTheme(<RegisterPage />);

    fireEvent.change(screen.getByTestId('name-input').querySelector('input')!, {
      target: { value: 'Maria' },
    });
    fireEvent.change(screen.getByTestId('email-input').querySelector('input')!, {
      target: { value: 'dup@test.com' },
    });
    fireEvent.change(screen.getByTestId('password-input').querySelector('input')!, {
      target: { value: 'senha123' },
    });
    fireEvent.click(screen.getByTestId('register-button'));

    await waitFor(() => {
      expect(screen.getByText('E-mail já cadastrado')).toBeTruthy();
    });
  });
});
