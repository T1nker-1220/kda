import { StorageConfig, StorageDirectory } from '@/types/storage.types';

/**
 * Storage configuration for different content types
 * Implements structured organization for Phase 2
 */
export const STORAGE_CONFIG: Record<StorageDirectory, StorageConfig> = {
  products: {
    bucket: 'images',
    directory: 'products',
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/png'],
    cacheControl: 'public, max-age=31536000, immutable' // 1 year cache for static images
  },
  categories: {
    bucket: 'images',
    directory: 'categories',
    maxSize: 2 * 1024 * 1024,
    allowedTypes: ['image/png'],
    cacheControl: 'public, max-age=31536000, immutable'
  },
  variants: {
    bucket: 'images',
    directory: 'variants',
    maxSize: 2 * 1024 * 1024,
    allowedTypes: ['image/png'],
    cacheControl: 'public, max-age=31536000, immutable'
  }
} as const;

/**
 * Naming conventions for different content types
 */
export const NAMING_CONVENTIONS = {
  products: {
    prefix: 'prod',
    pattern: /^prod-[a-z0-9-]+\.png$/
  },
  categories: {
    prefix: 'cat',
    pattern: /^cat-[a-z0-9-]+\.png$/
  },
  variants: {
    prefix: 'var',
    pattern: /^var-[a-z0-9-]+\.png$/
  }
} as const;

/**
 * Access patterns for storage operations
 */
export const ACCESS_PATTERNS = {
  public: {
    read: true,
    write: false
  },
  authenticated: {
    read: true,
    write: false
  },
  admin: {
    read: true,
    write: true
  }
} as const;

/**
 * CORS configuration for storage buckets
 */
export const CORS_CONFIG = {
  allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
  allowedMethods: ['GET'],
  allowedHeaders: ['*'],
  maxAge: 600 // 10 minutes
} as const;

/**
 * Cache configuration for different storage operations
 */
export const CACHE_CONFIG = {
  browser: {
    maxAge: 31536000, // 1 year
    staleWhileRevalidate: 86400 // 1 day
  },
  cdn: {
    maxAge: 31536000,
    staleWhileRevalidate: 86400
  },
  api: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 300 // 5 minutes
  }
} as const;
