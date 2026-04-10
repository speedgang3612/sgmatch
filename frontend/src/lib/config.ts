// Runtime configuration
let runtimeConfig: {
  API_BASE_URL: string;
} | null = null;

// Configuration loading state
let configLoading = true;

// Default fallback configuration
const defaultConfig = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://sgmatch.onrender.com',
};

// #11 — 개발 환경에서만 로그 출력 (운영 환경에서는 자동으로 숨김)
// Vite 빌드 시 import.meta.env.DEV = true(dev) / false(prod) 자동 설정
const debugLog = (...args: unknown[]): void => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

// Function to load runtime configuration
export async function loadRuntimeConfig(): Promise<void> {
  try {
    debugLog('🔧 DEBUG: Starting to load runtime config...');
    // Try to load configuration from a config endpoint
    const response = await fetch('/api/config');
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      // Only parse as JSON if the response is actually JSON
      if (contentType && contentType.includes('application/json')) {
        runtimeConfig = await response.json();
        debugLog('Runtime config loaded successfully');
      } else {
        debugLog(
          'Config endpoint returned non-JSON response, skipping runtime config'
        );
      }
    } else {
      debugLog(
        '🔧 DEBUG: Config fetch failed with status:',
        response.status
      );
    }
  } catch (error) {
    debugLog('Failed to load runtime config, using defaults:', error);
  } finally {
    configLoading = false;
    debugLog(
      '🔧 DEBUG: Config loading finished, configLoading set to false'
    );
  }
}

// Get current configuration
export function getConfig() {
  // If config is still loading, return default config to avoid using stale Vite env vars
  if (configLoading) {
    debugLog('Config still loading, using default config');
    return defaultConfig;
  }

  // First try runtime config (for Lambda)
  if (runtimeConfig) {
    debugLog('Using runtime config');
    return runtimeConfig;
  }

  // Then try Vite environment variables (for local development)
  if (import.meta.env.VITE_API_BASE_URL) {
    const viteConfig = {
      API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    };
    debugLog('Using Vite environment config');
    return viteConfig;
  }

  // Finally fall back to default
  debugLog('Using default config');
  return defaultConfig;
}

// Dynamic API_BASE_URL getter - this will always return the current config
export function getAPIBaseURL(): string {
  return getConfig().API_BASE_URL;
}

// For backward compatibility, but this should be avoided
// Removed static export to prevent using stale config values
// export const API_BASE_URL = getAPIBaseURL();

export const config = {
  get API_BASE_URL() {
    return getAPIBaseURL();
  },
};

