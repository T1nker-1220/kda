import { StorageDirectory } from '@/types/storage.types';
import { NAMING_CONVENTIONS, STORAGE_CONFIG } from './config';

/**
 * Generates a storage URL for accessing files
 * @param directory - The storage directory (products/categories/variants)
 * @param fileName - The file name including extension
 * @returns Full URL to access the file
 */
export const generateStorageUrl = (
  directory: StorageDirectory,
  fileName: string
): string => {
  if (!validatePath(directory, fileName)) {
    throw new Error('Invalid storage path');
  }
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL;
  const config = STORAGE_CONFIG[directory];
  return `${baseUrl}/${config.bucket}/${config.directory}/${fileName}`;
};

/**
 * Validates a storage path's directory and file name
 * @param directory - The storage directory to validate
 * @param fileName - The file name to validate
 * @returns True if path is valid
 */
export const validatePath = (
  directory: StorageDirectory,
  fileName: string
): boolean => {
  const lowerFileName = fileName.toLowerCase();
  const pattern = NAMING_CONVENTIONS[directory].pattern;
  return pattern.test(lowerFileName) && fileName === lowerFileName;
};

/**
 * Validates a file's size against the maximum limit
 * @param size - File size in bytes
 * @param directory - The storage directory to check against
 * @returns True if size is within limits
 */
export const validateFileSize = (
  size: number,
  directory: StorageDirectory
): boolean => {
  return size <= STORAGE_CONFIG[directory].maxSize;
};

/**
 * Generates a unique file name for storage
 * @param originalName - Original file name
 * @param directory - Target storage directory
 * @returns Sanitized unique file name
 */
export const generateFileName = (
  originalName: string,
  directory: StorageDirectory
): string => {
  const timestamp = Date.now();
  const prefix = NAMING_CONVENTIONS[directory].prefix;
  const baseName = originalName
    .toLowerCase()
    .replace(/\.png$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${prefix}-${baseName}-${timestamp}.png`;
};

/**
 * Extracts file extension from a file name
 * @param fileName - File name to process
 * @returns File extension without dot
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

/**
 * Checks if a file type is allowed for a directory
 * @param mimeType - File MIME type to check
 * @param directory - The storage directory to check against
 * @returns True if file type is allowed
 */
export const isAllowedFileType = (
  mimeType: string,
  directory: StorageDirectory
): boolean => {
  return STORAGE_CONFIG[directory].allowedTypes.includes(mimeType as 'image/png');
};
