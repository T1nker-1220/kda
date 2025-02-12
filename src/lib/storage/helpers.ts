import { StorageDirectory, UploadOptions } from '@/types/storage.types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CACHE_CONFIG, STORAGE_CONFIG } from './config';
import { StorageError } from './errors';
import { generateFileName, generateStorageUrl, isAllowedFileType, validateFileSize, validatePath } from './url';

/**
 * Uploads a file to storage with validation and error handling
 * @param file - File to upload
 * @param options - Upload options
 * @returns URL of uploaded file
 */
export const uploadFile = async (
  file: File,
  options: UploadOptions
): Promise<string> => {
  const config = STORAGE_CONFIG[options.directory];

  // Validate file type
  if (!isAllowedFileType(file.type, options.directory)) {
    throw new StorageError('INVALID_TYPE', 'Only PNG files are allowed', {
      allowedTypes: config.allowedTypes
    });
  }

  // Validate file size
  if (!validateFileSize(file.size, options.directory)) {
    throw new StorageError('FILE_TOO_LARGE', 'File exceeds size limit', {
      maxSize: config.maxSize
    });
  }

  // Generate unique file name
  const fileName = generateFileName(options.fileName, options.directory);

  // Validate path
  if (!validatePath(options.directory, fileName)) {
    throw new StorageError('INVALID_PATH', 'Invalid file path');
  }

  try {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase.storage
      .from(config.bucket)
      .upload(`${config.directory}/${fileName}`, file, {
        cacheControl: config.cacheControl,
        contentType: 'image/png',
        upsert: false
      });

    if (error) throw error;

    return generateStorageUrl(options.directory, fileName);
  } catch (error) {
    throw new StorageError('UPLOAD_FAILED', 'Failed to upload file', error, true);
  }
};

/**
 * Deletes a file from storage
 * @param directory - Storage directory
 * @param fileName - File name to delete
 */
export const deleteFile = async (
  directory: StorageDirectory,
  fileName: string
): Promise<void> => {
  const config = STORAGE_CONFIG[directory];

  // Validate path
  if (!validatePath(directory, fileName)) {
    throw new StorageError('INVALID_PATH', 'Invalid file path');
  }

  try {
    const supabase = createClientComponentClient();

    const { error } = await supabase.storage
      .from(config.bucket)
      .remove([`${config.directory}/${fileName}`]);

    if (error) throw error;
  } catch (error) {
    throw new StorageError('DELETE_FAILED', 'Failed to delete file', error, true);
  }
};

/**
 * Lists files in a storage directory
 * @param directory - Directory to list
 * @returns List of files
 */
export const listFiles = async (
  directory: StorageDirectory
): Promise<string[]> => {
  const config = STORAGE_CONFIG[directory];

  try {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase.storage
      .from(config.bucket)
      .list(config.directory, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) throw error;

    return data.map(file => file.name);
  } catch (error) {
    throw new StorageError('LIST_FAILED', 'Failed to list files', error, true);
  }
};

/**
 * Gets a temporary download URL for a file
 * @param directory - Storage directory
 * @param fileName - File name
 * @param expiresIn - Expiration time in seconds
 * @returns Temporary download URL
 */
export const getDownloadUrl = async (
  directory: StorageDirectory,
  fileName: string,
  expiresIn: number = CACHE_CONFIG.api.maxAge
): Promise<string> => {
  const config = STORAGE_CONFIG[directory];

  // Validate path
  if (!validatePath(directory, fileName)) {
    throw new StorageError('INVALID_PATH', 'Invalid file path');
  }

  try {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase.storage
      .from(config.bucket)
      .createSignedUrl(`${config.directory}/${fileName}`, expiresIn, {
        download: false,
        transform: {
          quality: 80, // Optimize image quality
          width: 1200, // Max width for responsive images
          height: 1200 // Max height for responsive images
        }
      });

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    throw new StorageError('DOWNLOAD_FAILED', 'Failed to generate download URL', error, true);
  }
};
