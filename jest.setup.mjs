import "@testing-library/jest-dom";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Mock Supabase client FIRST
global.jest = {
  ...global.jest,
  mock: (moduleName, factory) => {
    return jest.mock(moduleName, factory);
  },
};

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
  })),
}));

// Mock Supabase SSR
jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getSession: jest
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
    })),
  })),
  createServerClient: jest.fn(),
}));

// Mock ALL thunk files with proper async thunk structure
jest.mock("~/store/thunks/fetchAllDecks", () => ({
  __esModule: true,
  default: createAsyncThunk("decks/fetchAll", async () => []),
}));

jest.mock("~/store/thunks/deleteArchenemyDeck", () => ({
  __esModule: true,
  default: createAsyncThunk("decks/delete", async () => ({})),
}));

jest.mock("~/store/thunks/saveArchenemyDeck", () => ({
  __esModule: true,
  default: createAsyncThunk("decks/save", async () => ({})),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: "/",
      query: {},
      asPath: "/",
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Mock Mantine notifications
jest.mock("@mantine/notifications", () => ({
  notifications: {
    show: jest.fn(),
    hide: jest.fn(),
    clean: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
