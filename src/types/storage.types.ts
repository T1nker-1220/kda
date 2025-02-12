/**
 * Storage types and interfaces for managing file uploads and storage operations
 * Supports PNG images with size limits and directory-based organization
 */

/**
 * Valid storage directories for organizing files
 */
export type StorageDirectory = 'products' | 'categories' | 'variants';

/**
 * Storage configuration for managing uploads and files
 */
export interface StorageConfig {
  bucket: string;
  directory: StorageDirectory;
  maxSize: number;
  allowedTypes: string[];
  cacheControl: string;
}

/**
 * Options for file upload operations
 */
export interface UploadOptions {
  fileName: string;
  contentType: 'image/png';
  directory: StorageDirectory;
  maxSize?: number; // Default 2MB
}

/**
 * Storage operation error with details and retry information
 */
export interface StorageError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

/**
 * Default storage configuration values
 */
export const STORAGE_DEFAULTS = {
  maxSize: 2 * 1024 * 1024, // 2MB
  cacheControl: 'max-age=3600',
  allowedTypes: ['image/png']
} as const;

/**
 * Error codes for storage operations
 */
export const STORAGE_ERROR_CODES = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_TYPE: 'INVALID_TYPE',
  INVALID_PATH: 'INVALID_PATH',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  DELETE_FAILED: 'DELETE_FAILED',
  DOWNLOAD_FAILED: 'DOWNLOAD_FAILED'
} as const;

/**
 * Valid directories for storage operations
 */
export const VALID_DIRECTORIES: StorageDirectory[] = ['products', 'categories', 'variants'];
