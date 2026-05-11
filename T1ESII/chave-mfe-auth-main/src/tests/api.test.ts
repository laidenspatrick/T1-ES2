import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveTokens, clearTokens, getAccessToken } from '../services/api';

describe('api helpers - localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saveTokens armazena access_token e refresh_token', () => {
    saveTokens('acc-token', 'ref-token');
    expect(localStorage.getItem('access_token')).toBe('acc-token');
    expect(localStorage.getItem('refresh_token')).toBe('ref-token');
  });

  it('clearTokens remove os tokens', () => {
    saveTokens('acc-token', 'ref-token');
    clearTokens();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('getAccessToken retorna null quando não há token', () => {
    expect(getAccessToken()).toBeNull();
  });

  it('getAccessToken retorna o token salvo', () => {
    saveTokens('meu-token', 'ref');
    expect(getAccessToken()).toBe('meu-token');
  });
});

describe('api.login - fetch mock', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('chama /auth/login com email e password', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'tok', refresh_token: 'ref' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { api } = await import('../services/api');
    const result = await api.login({ email: 'a@b.com', password: '123456' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.access_token).toBe('tok');
  });

  it('lança erro com mensagem da API em caso de falha', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Credenciais inválidas' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { api } = await import('../services/api');
    await expect(api.login({ email: 'x@y.com', password: 'wrong' })).rejects.toThrow(
      'Credenciais inválidas'
    );
  });
});