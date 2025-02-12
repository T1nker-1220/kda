import { STORAGE_DEFAULTS, StorageDirectory, UploadOptions } from '@/types/storage.types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { StorageError } from './errors';
import { generateFileName, generateStorageUrl, isAllowedFileType, validatePath } from './url';

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
  // Validate file type
  if (!isAllowedFileType(file.type)) {
    throw new StorageError('INVALID_TYPE', 'Only PNG files are allowed', {
      allowedTypes: STORAGE_DEFAULTS.allowedTypes
    });
  }

  // Validate file size
  if (file.size > (options.maxSize ?? STORAGE_DEFAULTS.maxSize)) {
    throw new StorageError('FILE_TOO_LARGE', 'File exceeds size limit', {
      maxSize: STORAGE_DEFAULTS.maxSize
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
      .from('images')
      .upload(`${options.directory}/${fileName}`, file, {
        cacheControl: '3600',
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
  // Validate path
  if (!validatePath(directory, fileName)) {
    throw new StorageError('INVALID_PATH', 'Invalid file path');
  }

  try {
    const supabase = createClientComponentClient();

    const { error } = await supabase.storage
      .from('images')
      .remove([`${directory}/${fileName}`]);

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
  try {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase.storage
      .from('images')
      .list(directory);

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
  expiresIn: number = 60
): Promise<string> => {
  // Validate path
  if (!validatePath(directory, fileName)) {
    throw new StorageError('INVALID_PATH', 'Invalid file path');
  }

  try {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase.storage
      .from('images')
      .createSignedUrl(`${directory}/${fileName}`, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    throw new StorageError('DOWNLOAD_FAILED', 'Failed to generate download URL', error, true);
  }
};
