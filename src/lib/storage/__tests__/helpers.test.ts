import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageError } from '../errors';
import { deleteFile, getDownloadUrl, listFiles, uploadFile } from '../helpers';

// Mock Supabase client
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: vi.fn()
}));

describe('Storage Helpers', () => {
  let mockFile: File;
  const timestamp = Date.now();

  beforeEach(() => {
    mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    vi.clearAllMocks();
    vi.setSystemTime(timestamp);
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const mockUpload = vi.fn().mockResolvedValue({ data: { path: 'test' }, error: null });
      vi.mocked(createClientComponentClient).mockReturnValue({
        storage: {
          from: () => ({
            upload: mockUpload
          })
        }
      } as any);

      const result = await uploadFile(mockFile, {
        fileName: 'test.png',
        contentType: 'image/png',
        directory: 'products'
      });

      expect(result).toBe(`${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}/images/products/test-${timestamp}.png`);
      expect(mockUpload).toHaveBeenCalledWith(
        `products/test-${timestamp}.png`,
        mockFile,
        expect.objectContaining({
          cacheControl: '3600',
          contentType: 'image/png',
          upsert: false
        })
      );
    });

    it('should reject invalid file types', async () => {
      const invalidFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await expect(uploadFile(invalidFile, {
        fileName: 'test.jpg',
        contentType: 'image/png',
        directory: 'products'
      })).rejects.toThrow(StorageError);
    });

    it('should reject files exceeding size limit', async () => {
      const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.png', { type: 'image/png' });
      await expect(uploadFile(largeFile, {
        fileName: 'large.png',
        contentType: 'image/png',
        directory: 'products'
      })).rejects.toThrow(StorageError);
    });

    it('should handle upload errors', async () => {
      const mockUpload = vi.fn().mockResolvedValue({ error: { message: 'Upload failed' } });
      vi.mocked(createClientComponentClient).mockReturnValue({
        storage: {
          from: () => ({
            upload: mockUpload
          })
        }
      } as any);

      await expect(uploadFile(mockFile, {
        fileName: 'test.png',
        contentType: 'image/png',
        directory: 'products'
      })).rejects.toThrow(StorageError);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const mockRemove = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(createClientComponentClient).mockReturnValue({
        storage: {
          from: () => ({
            remove: mockRemove
          })
        }
      } as any);

      await deleteFile('products', 'test.png');
      expect(mockRemove).toHaveBeenCalledWith(['products/test.png']);
    });

    it('should handle delete errors', async () => {
      const mockRemove = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } });
      vi.mocked(createClientComponentClient).mockReturnValue({
        storage: {
          from: () => ({
            remove: mockRemove
          })
        }
      } as any);

      await expect(deleteFile('products', 'test.png')).rejects.toThrow(StorageError);
    });

    it('should reject invalid paths', async () => {
      await expect(deleteFile('products', 'test.jpg')).rejects.toThrow(StorageError);
    });
  });

  describe('listFiles', () => {
    it('should list files successfully', async () => {
      const mockFiles = [{ name: 'test1.png' }, { name: 'test2.png' }];
      const mockList = vi.fn().mockResolvedValue({ data: mockFiles, error: null });
      vi.mocked(createClientComponentClient).mockReturnValue({
        storage: {
          from: () => ({
            list: mockList
          })
        }
      } as any);

      const result = await listFiles('products');
      expect(result).toEqual(['test1.png', 'test2.png']);
      expect(mockList).toHaveBeenCalledWith('products');
    });

    it('should handle list errors', async () => {
      const mockList = vi.fn().mockResolvedValue({ error: { message: 'List failed' } });
      vi.mocked(createClientComponentClient).mockReturnValue({
        storage: {
          from: () => ({
            list: mockList
          })
        }
      } as any);

      await expect(listFiles('products')).rejects.toThrow(StorageError);
    });
  });

  describe('getDownloadUrl', () => {
    it('should get download URL successfully', async () => {
      const mockUrl = 'https://test-url.com';
      const mockCreateSignedUrl = vi.fn().mockResolvedValue({ data: { signedUrl: mockUrl }, error: null });
      vi.mocked(createClientComponentClient).mockReturnValue({
        storage: {
          from: () => ({
            createSignedUrl: mockCreateSignedUrl
          })
        }
      } as any);

      const result = await getDownloadUrl('products', 'test.png');
      expect(result).toBe(mockUrl);
      expect(mockCreateSignedUrl).toHaveBeenCalledWith('products/test.png', 60);
    });

    it('should handle URL generation errors', async () => {
      const mockCreateSignedUrl = vi.fn().mockResolvedValue({ error: { message: 'URL generation failed' } });
      vi.mocked(createClientComponentClient).mockReturnValue({
        storage: {
          from: () => ({
            createSignedUrl: mockCreateSignedUrl
          })
        }
      } as any);

      await expect(getDownloadUrl('products', 'test.png')).rejects.toThrow(StorageError);
    });

    it('should reject invalid paths', async () => {
      await expect(getDownloadUrl('products', 'test.jpg')).rejects.toThrow(StorageError);
    });
  });
});
