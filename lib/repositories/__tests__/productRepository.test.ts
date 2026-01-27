import type { Product, ProductFilters } from '@/lib/types/product';
import {
  applyFilters,
  applySort,
  toProductListItem,
} from '../productRepository';

// Export internal functions for testing
// In a real scenario, we might want to refactor to make these testable
// For now, we'll test the logic indirectly through integration or mock the external calls

describe('productRepository utilities', () => {
  const mockProducts: Product[] = [
    {
      id: 1,
      title: 'iPhone 15 Pro',
      description: 'Latest iPhone with advanced features',
      price: 999,
      category: 'smartphones',
      thumbnail: 'https://example.com/iphone.jpg',
      rating: 4.8,
      stock: 50,
    },
    {
      id: 2,
      title: 'Samsung Galaxy S24',
      description: 'Android flagship phone',
      price: 799,
      category: 'smartphones',
      thumbnail: 'https://example.com/galaxy.jpg',
      rating: 4.5,
      stock: 30,
    },
    {
      id: 3,
      title: 'MacBook Pro 16"',
      description: 'Apple laptop for professionals',
      price: 2499,
      category: 'laptops',
      thumbnail: 'https://example.com/macbook.jpg',
      rating: 4.9,
      stock: 15,
    },
    {
      id: 4,
      title: 'Dell XPS 15',
      description: 'Windows laptop',
      price: 1499,
      category: 'laptops',
      thumbnail: 'https://example.com/dell.jpg',
      rating: 4.3,
      stock: 20,
    },
  ];

  describe('toProductListItem', () => {
    it('should map Product to ProductListItem correctly', () => {
      const product = mockProducts[0];
      const listItem = toProductListItem(product);

      expect(listItem).toEqual({
        id: 1,
        title: 'iPhone 15 Pro',
        price: 999,
        category: 'smartphones',
        thumbnail: 'https://example.com/iphone.jpg',
        rating: 4.8,
        stock: 50,
      });

      expect(listItem).not.toHaveProperty('description');
      expect(listItem).not.toHaveProperty('brand');
    });
  });

  describe('applyFilters', () => {
    it('should filter by category', () => {
      const filters: ProductFilters = { category: 'smartphones' };
      const result = applyFilters(mockProducts, filters);

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.category === 'smartphones')).toBe(true);
    });

    it('should filter by minPrice', () => {
      const filters: ProductFilters = { minPrice: 1000 };
      const result = applyFilters(mockProducts, filters);

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.price >= 1000)).toBe(true);
    });

    it('should filter by maxPrice', () => {
      const filters: ProductFilters = { maxPrice: 1000 };
      const result = applyFilters(mockProducts, filters);

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.price <= 1000)).toBe(true);
    });

    it('should filter by price range', () => {
      const filters: ProductFilters = { minPrice: 800, maxPrice: 1500 };
      const result = applyFilters(mockProducts, filters);

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.price >= 800 && p.price <= 1500)).toBe(
        true,
      );
    });

    it('should filter by search term in title', () => {
      const filters: ProductFilters = { search: 'iPhone' };
      const result = applyFilters(mockProducts, filters);

      expect(result).toHaveLength(1);
      expect(result[0].title).toContain('iPhone');
    });

    it('should filter by search term in description', () => {
      const filters: ProductFilters = { search: 'Android' };
      const result = applyFilters(mockProducts, filters);

      expect(result).toHaveLength(1);
      expect(result[0].description).toContain('Android');
    });

    it('should filter by search term in category', () => {
      const filters: ProductFilters = { search: 'laptops' };
      const result = applyFilters(mockProducts, filters);

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.category === 'laptops')).toBe(true);
    });

    it('should be case-insensitive for search', () => {
      const filters: ProductFilters = { search: 'IPHONE' };
      const result = applyFilters(mockProducts, filters);

      expect(result).toHaveLength(1);
    });

    it('should combine multiple filters', () => {
      const filters: ProductFilters = {
        category: 'smartphones',
        // Use a minPrice that actually includes the Samsung product (799)
        minPrice: 700,
        search: 'Samsung',
      };
      const result = applyFilters(mockProducts, filters);

      expect(result).toHaveLength(1);
      expect(result[0].title).toContain('Samsung');
    });

    it('should return all products when no filters applied', () => {
      const filters: ProductFilters = {};
      const result = applyFilters(mockProducts, filters);

      expect(result).toHaveLength(4);
    });
  });

  describe('applySort', () => {
    it('should sort by price ascending', () => {
      const sorted = applySort(mockProducts, 'price_asc');

      expect(sorted[0].price).toBe(799);
      expect(sorted[1].price).toBe(999);
      expect(sorted[2].price).toBe(1499);
      expect(sorted[3].price).toBe(2499);
    });

    it('should sort by price descending', () => {
      const sorted = applySort(mockProducts, 'price_desc');

      expect(sorted[0].price).toBe(2499);
      expect(sorted[3].price).toBe(799);
    });

    it('should sort by rating ascending', () => {
      const sorted = applySort(mockProducts, 'rating_asc');

      expect(sorted[0].rating).toBe(4.3);
      expect(sorted[3].rating).toBe(4.9);
    });

    it('should sort by rating descending', () => {
      const sorted = applySort(mockProducts, 'rating_desc');

      expect(sorted[0].rating).toBe(4.9);
      expect(sorted[3].rating).toBe(4.3);
    });

    it('should sort by title ascending', () => {
      const sorted = applySort(mockProducts, 'title_asc');

      expect(sorted[0].title).toBe('Dell XPS 15');
      expect(sorted[1].title).toBe('iPhone 15 Pro');
    });

    it('should sort by title descending', () => {
      const sorted = applySort(mockProducts, 'title_desc');

      expect(sorted[0].title).toBe('Samsung Galaxy S24');
    });

    it('should return original array when no sort specified', () => {
      const sorted = applySort(mockProducts);

      expect(sorted).toEqual(mockProducts);
      expect(sorted).not.toBe(mockProducts); // Should be a copy
    });

    it('should not mutate original array', () => {
      const original = [...mockProducts];
      applySort(mockProducts, 'price_asc');

      expect(mockProducts).toEqual(original);
    });
  });
});

// Functions are now exported from the repository module
