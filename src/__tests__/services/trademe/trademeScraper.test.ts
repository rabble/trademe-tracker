import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { trademeScraper } from '../../../services/trademe/trademeScraper';
import FireCrawl from '@mendable/firecrawl-js';

// Mock FireCrawl
jest.mock('@mendable/firecrawl-js');

describe('trademeScraper', () => {
  let mockScrape: jest.Mock;

  beforeEach(() => {
    // Setup the mock implementation
    mockScrape = jest.fn();
    (FireCrawl as unknown as jest.Mock).mockImplementation(() => ({
      scrape: mockScrape
    }));
  });

  it('should extract property data from a valid TradeMe response', async () => {
    // Mock a successful response from FireCrawl
    const mockResponse = {
      data: {
        title: 'Beautiful 3 Bedroom Home in Auckland',
        ogTitle: 'Beautiful 3 Bedroom Home in Auckland | Trade Me Property',
        description: 'This lovely property features 3 bedrooms and 2 bathrooms.',
        images: [
          'https://trademe.tmcdn.co.nz/photoserver/full/123456.jpg',
          'https://trademe.tmcdn.co.nz/photoserver/full/123457.jpg'
        ],
        text: 'Price: $850,000. 3 bedrooms, 2 bathrooms. Amazing location in Auckland.'
      }
    };

    mockScrape.mockResolvedValue(mockResponse);

    // Call the scrapeUrl method
    const result = await trademeScraper.scrapeUrl('https://www.trademe.co.nz/a/property/residential/sale/auckland/123456');

    // Verify the result
    expect(result).toHaveProperty('title', 'Beautiful 3 Bedroom Home in Auckland');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('image_urls');
    expect(result).toHaveProperty('price');
    expect(result).toHaveProperty('bedrooms', 3);
    expect(result).toHaveProperty('bathrooms', 2);
  });

  it('should handle errors and retry scraping', async () => {
    // Mock a failure then success
    mockScrape
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        data: {
          title: 'Property After Retry',
          text: 'Price: $750,000'
        }
      });

    // Call the scrapeUrl method
    const result = await trademeScraper.scrapeUrl('https://www.trademe.co.nz/a/property/residential/sale/auckland/123456');

    // Verify the result
    expect(result).toHaveProperty('title', 'Property After Retry');
    expect(mockScrape).toHaveBeenCalledTimes(2); // Should have retried
  });

  it('should return a valid property with minimal data if scraping fails completely', async () => {
    // Mock complete failure
    mockScrape.mockRejectedValue(new Error('Network error'));

    // Call the scrapeUrl method
    const result = await trademeScraper.scrapeUrl('https://www.trademe.co.nz/a/property/residential/sale/auckland/123456');

    // Verify we get a minimal valid property object
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('status', 'active');
    expect(result).toHaveProperty('listing_type');
  });

  it('should extract listing ID from the URL', async () => {
    // Mock a successful response
    mockScrape.mockResolvedValue({
      data: {
        title: 'Sample Property',
      }
    });

    // Call with a URL containing a listing ID
    const result = await trademeScraper.scrapeUrl('https://www.trademe.co.nz/a/property/residential/sale/auckland/listing/4567890');

    // Verify the listing ID was extracted
    expect(result).toHaveProperty('trademe_listing_id', '4567890');
  });
});