import { describe, expect, it, vi } from 'vitest';
import { generateFileName, generateStorageUrl, isAllowedFileType, validatePath } from '../url';

describe('URL Generation Utilities', () => {
  describe('generateStorageUrl', () => {
    it('should generate correct URL for valid inputs', () => {
      const url = generateStorageUrl('products', 'test-image.png');
      expect(url).toBe(`${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}/images/products/test-image.png`);
    });

    it('should throw error for invalid path', () => {
      expect(() => generateStorageUrl('invalid' as any, 'test.png')).toThrow('Invalid storage path');
    });
  });

  describe('validatePath', () => {
    it('should validate correct product paths', () => {
      expect(validatePath('products', 'test-image.png')).toBe(true);
    });

    it('should validate correct category paths', () => {
      expect(validatePath('categories', 'category-image.png')).toBe(true);
    });

    it('should validate correct variant paths', () => {
      expect(validatePath('variants', 'variant-image.png')).toBe(true);
    });

    it('should reject invalid directories', () => {
      expect(validatePath('invalid' as any, 'test.png')).toBe(false);
    });

    it('should reject non-PNG files', () => {
      expect(validatePath('products', 'test.jpg')).toBe(false);
    });

    it('should reject invalid file names', () => {
      expect(validatePath('products', 'test image.png')).toBe(false);
      expect(validatePath('products', 'TEST.png')).toBe(false);
      expect(validatePath('products', '.png')).toBe(false);
    });
  });

  describe('generateFileName', () => {
    const timestamp = Date.now();
    vi.setSystemTime(timestamp);

    it('should generate valid file names', () => {
      const fileName = generateFileName('Test Image.png', 'products');
      expect(fileName).toBe(`test-image-${timestamp}.png`);
    });

    it('should handle special characters', () => {
      const fileName = generateFileName('Test@#$%^&*.png', 'products');
      expect(fileName).toBe(`test-${timestamp}.png`);
    });

    it('should handle multiple spaces and dashes', () => {
      const fileName = generateFileName('Test  --  Image.png', 'products');
      expect(fileName).toBe(`test-image-${timestamp}.png`);
    });
  });

  describe('isAllowedFileType', () => {
    it('should allow PNG files', () => {
      expect(isAllowedFileType('image/png')).toBe(true);
    });

    it('should reject non-PNG files', () => {
      expect(isAllowedFileType('image/jpeg')).toBe(false);
      expect(isAllowedFileType('image/gif')).toBe(false);
      expect(isAllowedFileType('application/pdf')).toBe(false);
    });
  });
});
