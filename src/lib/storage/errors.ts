import { STORAGE_DEFAULTS, STORAGE_ERROR_CODES } from '@/types/storage.types';

/**
 * Custom error class for storage operations
 */
export class StorageError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Handles storage operation errors and converts them to StorageError instances
 * @param error - Error to handle
 * @returns Standardized StorageError
 */
export const handleStorageError = (error: any): StorageError => {
  // Handle Supabase storage errors
  if (error?.error?.message) {
    return new StorageError(
      STORAGE_ERROR_CODES.UPLOAD_FAILED,
      error.error.message,
      error.error,
      true
    );
  }

  // Handle file size errors
  if (error?.statusCode === 413 || error?.code === STORAGE_ERROR_CODES.FILE_TOO_LARGE) {
    return new StorageError(
      STORAGE_ERROR_CODES.FILE_TOO_LARGE,
      'File exceeds size limit',
      { maxSize: STORAGE_DEFAULTS.maxSize },
      false
    );
  }

  // Handle file type errors
  if (error?.code === STORAGE_ERROR_CODES.INVALID_TYPE) {
    return new StorageError(
      STORAGE_ERROR_CODES.INVALID_TYPE,
      'Invalid file type',
      { allowedTypes: STORAGE_DEFAULTS.allowedTypes },
      false
    );
  }

  // Handle path errors
  if (error?.code === STORAGE_ERROR_CODES.INVALID_PATH) {
    return new StorageError(
      STORAGE_ERROR_CODES.INVALID_PATH,
      'Invalid storage path',
      error.details,
      false
    );
  }

  // Handle unknown errors
  return new StorageError(
    'UNKNOWN_ERROR',
    error?.message || 'An unknown error occurred',
    error,
    true
  );
};

/**
 * Retries an operation with exponential backoff
 * @param operation - Async operation to retry
 * @param maxAttempts - Maximum number of retry attempts
 * @returns Operation result
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Don't retry if error is not retryable
      if (error instanceof StorageError && !error.retryable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        throw error;
      }

      // Wait with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Operation failed');
};

/**
 * Creates a user-friendly error message
 * @param error - Error to create message for
 * @returns User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: StorageError): string => {
  switch (error.code) {
    case STORAGE_ERROR_CODES.FILE_TOO_LARGE:
      return `File is too large. Maximum size is ${STORAGE_DEFAULTS.maxSize / (1024 * 1024)}MB.`;
    case STORAGE_ERROR_CODES.INVALID_TYPE:
      return 'Only PNG images are allowed.';
    case STORAGE_ERROR_CODES.INVALID_PATH:
      return 'Invalid file path specified.';
    case STORAGE_ERROR_CODES.UPLOAD_FAILED:
      return 'Failed to upload file. Please try again.';
    case STORAGE_ERROR_CODES.DELETE_FAILED:
      return 'Failed to delete file. Please try again.';
    case STORAGE_ERROR_CODES.DOWNLOAD_FAILED:
      return 'Failed to download file. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
