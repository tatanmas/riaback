import type { Product } from '@/lib/types/product';
import { getProductsInsights } from '../productInsightsService';

// Mock the repository to avoid external API calls in tests
jest.mock('@/lib/repositories/productRepository', () => ({
  getProductsForInsights: jest.fn(),
  toProductListItem: (p: Product) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    category: p.category,
    thumbnail: p.thumbnail,
    rating: p.rating,
    stock: p.stock,
  }),
}));

import { getProductsForInsights } from '@/lib/repositories/productRepository';

const mockGetProductsForInsights = getProductsForInsights as jest.MockedFunction<
  typeof getProductsForInsights
>;

describe('productInsightsService', () => {
  const mockProducts: Product[] = [
    {
      id: 1,
      title: 'iPhone 15',
      description: 'Latest iPhone',
      price: 999,
      category: 'smartphones',
      thumbnail: 'https://example.com/iphone.jpg',
      rating: 4.8,
      stock: 50,
    },
    {
      id: 2,
      title: 'Samsung Galaxy',
      description: 'Android phone',
      price: 799,
      category: 'smartphones',
      thumbnail: 'https://example.com/galaxy.jpg',
      rating: 4.5,
      stock: 30,
    },
    {
      id: 3,
      title: 'MacBook Pro',
      description: 'Apple laptop',
      price: 1999,
      category: 'laptops',
      thumbnail: 'https://example.com/macbook.jpg',
      rating: 4.9,
      stock: 5, // Low stock
    },
    {
      id: 4,
      title: 'Dell XPS',
      description: 'Windows laptop',
      price: 1299,
      category: 'laptops',
      thumbnail: 'https://example.com/dell.jpg',
      rating: 4.3,
      stock: 20,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductsInsights', () => {
    it('should compute correct average price', async () => {
      mockGetProductsForInsights.mockResolvedValue(mockProducts);

      const insights = await getProductsInsights();

      // (999 + 799 + 1999 + 1299) / 4 = 1274
      expect(insights.averagePriceGlobal).toBe(1274);
    });

    it('should return 0 average price for empty products', async () => {
      mockGetProductsForInsights.mockResolvedValue([]);

      const insights = await getProductsInsights();

      expect(insights.averagePriceGlobal).toBe(0);
    });

    it('should compute correct total stock', async () => {
      mockGetProductsForInsights.mockResolvedValue(mockProducts);

      const insights = await getProductsInsights();

      // 50 + 30 + 5 + 20 = 105
      expect(insights.totalStock).toBe(105);
    });

    it('should identify most common category', async () => {
      mockGetProductsForInsights.mockResolvedValue(mockProducts);

      const insights = await getProductsInsights();

      expect(insights.mostCommonCategory).toEqual({
        name: 'smartphones',
        count: 2,
      });
    });

    it('should return null for most common category when no products', async () => {
      mockGetProductsForInsights.mockResolvedValue([]);

      const insights = await getProductsInsights();

      expect(insights.mostCommonCategory).toBeNull();
    });

    it('should compute low stock count correctly', async () => {
      mockGetProductsForInsights.mockResolvedValue(mockProducts);

      const insights = await getProductsInsights();

      // Only MacBook Pro has stock < 10 (threshold default is 10)
      expect(insights.lowStockCount).toBe(1);
    });

    it('should return top rated products sorted by rating', async () => {
      mockGetProductsForInsights.mockResolvedValue(mockProducts);

      const insights = await getProductsInsights();

      expect(insights.topRatedProducts).toHaveLength(4);
      expect(insights.topRatedProducts[0].rating).toBe(4.9); // MacBook Pro
      expect(insights.topRatedProducts[1].rating).toBe(4.8); // iPhone
      expect(insights.topRatedProducts[2].rating).toBe(4.5); // Samsung
      expect(insights.topRatedProducts[3].rating).toBe(4.3); // Dell
    });

    it('should compute stock by category correctly', async () => {
      mockGetProductsForInsights.mockResolvedValue(mockProducts);

      const insights = await getProductsInsights();

      const stockByCategory = insights.stockByCategory;
      expect(stockByCategory).toHaveLength(2);

      const smartphonesStock = stockByCategory.find(
        (s) => s.category === 'smartphones',
      );
      expect(smartphonesStock?.totalStock).toBe(80); // 50 + 30

      const laptopsStock = stockByCategory.find((s) => s.category === 'laptops');
      expect(laptopsStock?.totalStock).toBe(25); // 5 + 20
    });

    it('should respect filters when computing insights', async () => {
      const filteredProducts = mockProducts.filter(
        (p) => p.category === 'smartphones',
      );
      mockGetProductsForInsights.mockResolvedValue(filteredProducts);

      const insights = await getProductsInsights({ category: 'smartphones' });

      expect(insights.totalProducts).toBe(2);
      expect(insights.mostCommonCategory?.name).toBe('smartphones');
      expect(insights.mostCommonCategory?.count).toBe(2);
    });
  });
});
