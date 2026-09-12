import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom doesn't implement layout APIs used by some components.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

// localStorage is provided by jsdom but guard for environments without it.
if (typeof window !== 'undefined') {
  try {
    window.localStorage.setItem('__t__', '1');
    window.localStorage.removeItem('__t__');
  } catch {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => ({
        store: {},
        getItem(key: string) { return this.store[key] ?? null; },
        setItem(key: string, value: string) { this.store[key] = String(value); },
        removeItem(key: string) { delete this.store[key]; },
        clear() { this.store = {}; },
      }),
    });
  }
}

// jsdom lacks ResizeObserver / matchMedia used by chart/UI libs.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}
