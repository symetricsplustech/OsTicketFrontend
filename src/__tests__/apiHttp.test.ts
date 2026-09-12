// @vitest-environment node
import { beforeAll, describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { httpApi, httpStore, compatRequest, API_BASE } from '@shared/lib/api';

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) { return this.store.get(key) ?? null; }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
  removeItem(key: string) { this.store.delete(key); }
  clear() { this.store.clear(); }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
  get length() { return this.store.size; }
}

beforeAll(() => {
  (globalThis as any).localStorage ??= new MemoryStorage();
  (globalThis as any).window ??= { location: { href: '/dashboard' } };
});

function mockFetchOnce(status: number, body: unknown, headers: Record<string, string> = {}) {
  const response = new Response(JSON.stringify(body), {
    status,
    statusText: status === 200 ? 'OK' : 'ERR',
    headers: { 'content-type': 'application/json', ...headers },
  });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
  return vi.mocked(fetch);
}

describe('RTK Query transport (@shared/lib/api)', () => {
  beforeEach(() => {
    localStorage.clear();
    (globalThis as any).window.location.href = '/dashboard';
    httpStore.dispatch(httpApi.util.resetApiState());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('routes GET through RTK Query and returns an axios-compatible { data, status }', async () => {
    mockFetchOnce(200, { incidents: [{ _id: '1', title: 'X' }] });

    const res = await compatRequest('GET', '/core/incidents');
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ incidents: [{ _id: '1', title: 'X' }] });
    expect(fetch).toHaveBeenCalledTimes(1);
    const req = vi.mocked(fetch).mock.calls[0][0] as Request;
    expect(req.url).toContain('/core/incidents');
    expect(req.method).toBe('GET');
  });

  it('attaches the Authorization header when a token is stored', async () => {
    localStorage.setItem('token', 'abc123');
    mockFetchOnce(200, { ok: true });

    await compatRequest('GET', '/me');
    const req = vi.mocked(fetch).mock.calls[0][0] as Request;
    expect(req.headers.get('Authorization')).toBe('Bearer abc123');
  });

  it('rejects with an axios-compatible { response.status } on non-2xx', async () => {
    mockFetchOnce(403, { error: 'Forbidden' });
    await expect(compatRequest('GET', '/admin/x')).rejects.toMatchObject({
      response: { status: 403 },
    });
  });

  it('clears the session and bounces to /login on 401 when token + user exist', async () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ role: 'agent' }));

    mockFetchOnce(401, { message: 'Unauthorized' });
    await expect(compatRequest('GET', '/core/incidents')).rejects.toBeDefined();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect((globalThis as any).window.location.href).toBe('/login');
  });

  it('keeps the token (no redirect) on 401 when only a token exists', async () => {
    localStorage.setItem('token', 'tok');

    mockFetchOnce(401, { message: 'Unauthorized' });
    await expect(compatRequest('GET', '/core/incidents')).rejects.toBeDefined();
    expect(localStorage.getItem('token')).toBe('tok');
    expect(localStorage.getItem('user')).toBeNull();
    expect((globalThis as any).window.location.href).toBe('/dashboard');
  });

  it('sends JSON content-type with stringified bodies for POST', async () => {
    mockFetchOnce(201, { id: '42' });

    await compatRequest('POST', '/core/incidents', { title: 'Hi' });
    const req = vi.mocked(fetch).mock.calls[0][0] as Request;
    expect(String(req.headers.get('Content-Type'))).toContain('application/json');
    expect(req.method).toBe('POST');
    expect(await req.text()).toBe(JSON.stringify({ title: 'Hi' }));
  });

  it('defaults.baseURL exposes the configured API base', () => {
    expect(API_BASE).toBe(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1');
  });
});