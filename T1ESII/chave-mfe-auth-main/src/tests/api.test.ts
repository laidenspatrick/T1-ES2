import { describe, it, expect, beforeEach } from 'vitest';
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
