import { STORAGE_DEFAULTS, STORAGE_ERROR_CODES } from '@/types/storage.types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageError, getUserFriendlyErrorMessage, handleStorageError, withRetry } from '../errors';

describe('Storage Error Handling', () => {
  describe('StorageError', () => {
    it('should create error with correct properties', () => {
      const error = new StorageError('TEST_ERROR', 'Test message', { detail: 'test' }, true);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.retryable).toBe(true);
      expect(error.name).toBe('StorageError');
    });
  });

  describe('handleStorageError', () => {
    it('should handle Supabase storage errors', () => {
      const error = handleStorageError({
        error: { message: 'Supabase error' }
      });
      expect(error).toBeInstanceOf(StorageError);
      expect(error.code).toBe(STORAGE_ERROR_CODES.UPLOAD_FAILED);
      expect(error.retryable).toBe(true);
    });

    it('should handle file size errors', () => {
      const error = handleStorageError({
        statusCode: 413,
        code: STORAGE_ERROR_CODES.FILE_TOO_LARGE
      });
      expect(error).toBeInstanceOf(StorageError);
      expect(error.code).toBe(STORAGE_ERROR_CODES.FILE_TOO_LARGE);
      expect(error.retryable).toBe(false);
      expect(error.details).toEqual({ maxSize: STORAGE_DEFAULTS.maxSize });
    });

    it('should handle file type errors', () => {
      const error = handleStorageError({
        code: STORAGE_ERROR_CODES.INVALID_TYPE
      });
      expect(error).toBeInstanceOf(StorageError);
      expect(error.code).toBe(STORAGE_ERROR_CODES.INVALID_TYPE);
      expect(error.retryable).toBe(false);
      expect(error.details).toEqual({ allowedTypes: STORAGE_DEFAULTS.allowedTypes });
    });

    it('should handle path errors', () => {
      const error = handleStorageError({
        code: STORAGE_ERROR_CODES.INVALID_PATH,
        details: { path: 'invalid/path' }
      });
      expect(error).toBeInstanceOf(StorageError);
      expect(error.code).toBe(STORAGE_ERROR_CODES.INVALID_PATH);
      expect(error.retryable).toBe(false);
      expect(error.details).toEqual({ path: 'invalid/path' });
    });

    it('should handle unknown errors', () => {
      const error = handleStorageError({
        message: 'Unknown error'
      });
      expect(error).toBeInstanceOf(StorageError);
      expect(error.code).toBe('UNKNOWN_ERROR');
      expect(error.retryable).toBe(true);
      expect(error.message).toBe('Unknown error');
    });
  });

  describe('withRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return result on successful operation', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await withRetry(operation);
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('success');

      const resultPromise = withRetry(operation);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
      const error = new StorageError('TEST', 'test', {}, false);
      const operation = vi.fn().mockRejectedValue(error);
      await expect(withRetry(operation)).rejects.toThrow(error);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should respect max attempts', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('fail'));
      const promise = withRetry(operation, 3);
      await vi.runAllTimersAsync();
      await expect(promise).rejects.toThrow('fail');
      expect(operation).toHaveBeenCalledTimes(3);
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should return correct message for file size error', () => {
      const error = new StorageError(STORAGE_ERROR_CODES.FILE_TOO_LARGE, '');
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toBe(`File is too large. Maximum size is ${STORAGE_DEFAULTS.maxSize / (1024 * 1024)}MB.`);
    });

    it('should return correct message for file type error', () => {
      const error = new StorageError(STORAGE_ERROR_CODES.INVALID_TYPE, '');
      expect(getUserFriendlyErrorMessage(error)).toBe('Only PNG images are allowed.');
    });

    it('should return correct message for path error', () => {
      const error = new StorageError(STORAGE_ERROR_CODES.INVALID_PATH, '');
      expect(getUserFriendlyErrorMessage(error)).toBe('Invalid file path specified.');
    });

    it('should return correct message for upload error', () => {
      const error = new StorageError(STORAGE_ERROR_CODES.UPLOAD_FAILED, '');
      expect(getUserFriendlyErrorMessage(error)).toBe('Failed to upload file. Please try again.');
    });

    it('should return generic message for unknown error', () => {
      const error = new StorageError('UNKNOWN', '');
      expect(getUserFriendlyErrorMessage(error)).toBe('An unexpected error occurred. Please try again.');
    });
  });
});
