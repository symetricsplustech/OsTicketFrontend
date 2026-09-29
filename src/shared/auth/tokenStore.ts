const TOKEN_KEY = "osticket_token";
const TOKEN_USER_KEY = "osticket_user_json";
const TOKEN_INSTANCE_KEY = "osticket_instance_json";
const TOKEN_PERMISSIONS_KEY = "osticket_permissions_json";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const memory = new Map<string, string>();

const memoryStorage: StorageLike = {
  getItem: (key) => (memory.has(key) ? (memory.get(key) as string) : null),
  setItem: (key, value) => void memory.set(key, String(value)),
  removeItem: (key) => void memory.delete(key),
};

function storage(): StorageLike {
  try {
    const candidate = (globalThis as { localStorage?: StorageLike }).localStorage;
    if (!candidate) return memoryStorage;
    const probe = "__osticket_probe__";
    candidate.setItem(probe, "1");
    candidate.removeItem(probe);
    return candidate;
  } catch {
    return memoryStorage;
  }
}

function readJson<T>(key: string): T | null {
  const raw = (() => {
    try {
      return storage().getItem(key) ?? memory.get(key) ?? null;
    } catch {
      return memory.get(key) ?? null;
    }
  })();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  const encoded = JSON.stringify(value);
  memory.set(key, encoded);
  try {
    storage().setItem(key, encoded);
  } catch {
    /* storage unavailable — the in-memory copy is authoritative */
  }
}

function remove(key: string): void {
  try {
    storage().removeItem(key);
  } catch {
    /* storage unavailable — nothing to clear */
  }
}

export const TokenStore = {
  get(): string | null {
    try {
      const stored = storage().getItem(TOKEN_KEY);
      if (stored) return stored;
    } catch {
      /* storage unavailable — use the in-memory copy */
    }
    return memory.has(TOKEN_KEY) ? (memory.get(TOKEN_KEY) as string) : null;
  },
  set(token: string): void {
    try {
      storage().setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable — fall through to the in-memory copy */
    }
    memory.set(TOKEN_KEY, token);
  },
  clear(): void {
    remove(TOKEN_KEY);
    memory.delete(TOKEN_KEY);
  },
  getUser<T = unknown>(): T | null {
    return readJson<T>(TOKEN_USER_KEY);
  },
  setUser(user: unknown): void {
    writeJson(TOKEN_USER_KEY, user);
  },
  getInstance<T = unknown>(): T | null {
    return readJson<T>(TOKEN_INSTANCE_KEY);
  },
  setInstance(instance: unknown): void {
    writeJson(TOKEN_INSTANCE_KEY, instance);
  },
  getPermissions(): string[] {
    const value = readJson<unknown>(TOKEN_PERMISSIONS_KEY);
    return Array.isArray(value) ? (value as string[]) : [];
  },
  setPermissions(permissions: string[] | undefined): void {
    if (Array.isArray(permissions)) {
      writeJson(TOKEN_PERMISSIONS_KEY, permissions);
    } else {
      remove(TOKEN_PERMISSIONS_KEY);
    }
  },
  reset(): void {
    remove(TOKEN_KEY);
    remove(TOKEN_USER_KEY);
    remove(TOKEN_INSTANCE_KEY);
    remove(TOKEN_PERMISSIONS_KEY);
    memory.clear();
  },
};
