import { supabase } from '../../lib/supabase'
import { Property } from '../../types'

/**
 * Interface for portfolio summary
 */
export interface PortfolioSummary {
  totalProperties: number;
  activeProperties: number;
  underOfferProperties: number;
  soldProperties: number;
  averagePrice: number;
  averageDaysOnMarket: number;
}

/**
 * Interface for property change
 */
export interface PropertyChange {
  id: string;
  property_id: string;
  property_title: string;
  change_type: 'price' | 'status' | 'description';
  old_value: string;
  new_value: string;
  change_date: string;
}

/**
 * Interface for property insight
 */
export interface PropertyInsight {
  id: string;
  property_id: string;
  property_title: string;
  insight_type: 'price_trend' | 'market_comparison' | 'recommendation';
  insight_text: string;
  created_at: string;
}

/**
 * Type for property status counts
 */
interface StatusCounts {
  active: number;
  under_offer: number;
  sold: number;
  total: number;
}

/**
 * Service for analytics related to properties
 */
export const AnalyticsService = {
  /**
   * Fetch summary statistics for the property portfolio
   * 
   * @returns Promise with the portfolio summary
   */
  async fetchSummary(): Promise<PortfolioSummary> {
    try {
      // Check if the properties table exists
      try {
        const { count, error } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });
          
        if (error && error.code === 'PGRST204') {
          console.warn('Properties table does not exist yet');
          return {
            totalProperties: 0,
            activeProperties: 0,
            underOfferProperties: 0,
            soldProperties: 0,
            averagePrice: 0,
            averageDaysOnMarket: 0
          };
        }
      } catch (err) {
        console.warn('Error checking if properties table exists:', err);
        // Continue anyway
      }
      
      // Fetch all required data in parallel
      const [statusCounts, averagePrice, averageDaysOnMarket] = await Promise.all([
        this.fetchStatusCounts(),
        this.calculateAveragePrice(),
        this.calculateAverageDaysOnMarket()
      ]);

      return {
        totalProperties: statusCounts.total,
        activeProperties: statusCounts.active,
        underOfferProperties: statusCounts.under_offer,
        soldProperties: statusCounts.sold,
        averagePrice,
        averageDaysOnMarket
      };
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
      throw error;
    }
  },

  /**
   * Fetch counts of properties by status
   * 
   * @returns Promise with status counts
   */
  async fetchStatusCounts(): Promise<StatusCounts> {
    try {
      // Use proper GROUP BY clause
      const { data, error } = await supabase
        .from('properties')
        .select('status, count')
        .not('status', 'is', null)
        .group('status');

      if (error) {
        console.error('Error fetching status counts:', error);
        throw error;
      }

      const activeCount = this.extractCountForStatus(data, 'active');
      const underOfferCount = this.extractCountForStatus(data, 'under_offer');
      const soldCount = this.extractCountForStatus(data, 'sold');
      const totalCount = activeCount + underOfferCount + soldCount;

      return {
        active: activeCount,
        under_offer: underOfferCount,
        sold: soldCount,
        total: totalCount
      };
    } catch (error) {
      console.error('Error in fetchStatusCounts:', error);
      // Return empty counts on error
      return {
        active: 0,
        under_offer: 0,
        sold: 0,
        total: 0
      };
    }
  },

  /**
   * Extract count for a specific status from status counts data
   * 
   * @param data - Status counts data from database
   * @param status - Status to extract count for
   * @returns Count for the specified status
   */
  extractCountForStatus(data: Array<{status: string; count: number}>, status: string): number {
    return data.find(item => item.status === status)?.count || 0;
  },

  /**
   * Calculate average price of properties
   * 
   * @returns Promise with average price
   */
  async calculateAveragePrice(): Promise<number> {
    try {
      // Fetch all prices and calculate average on the client side
      const { data, error } = await supabase
        .from('properties')
        .select('price')
        .neq('status', 'archived');

      if (error) {
        console.error('Error fetching price data:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      // Calculate average manually
      const sum = data.reduce((total, item) => total + (item.price || 0), 0);
      return sum / data.length;
    } catch (error) {
      console.error('Error in calculateAveragePrice:', error);
      return 0;
    }
  },

  /**
   * Calculate average days on market
   * 
   * @returns Promise with average days on market
   */
  async calculateAverageDaysOnMarket(): Promise<number> {
    try {
      // Fetch all days_on_market values and calculate average on the client side
      const { data, error } = await supabase
        .from('properties')
        .select('days_on_market')
        .neq('status', 'archived');

      if (error) {
        console.error('Error fetching days on market data:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      // Calculate average manually
      const sum = data.reduce((total, item) => total + (item.days_on_market || 0), 0);
      return sum / data.length;
    } catch (error) {
      console.error('Error in calculateAverageDaysOnMarket:', error);
      return 0;
    }
  },

  /**
   * Calculate average of numeric values
   * 
   * @param values - Array of numeric values
   * @returns Average value or 0 if array is empty
   */
  calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((total, value) => total + value, 0);
    return sum / values.length;
  },

  /**
   * Fetch recent property changes
   * 
   * @param limit - Optional limit for the number of changes to fetch
   * @returns Promise with the recent property changes
   */
  async fetchRecentChanges(limit: number = 10): Promise<PropertyChange[]> {
    try {
      // Check if the property_changes table exists
      try {
        const { count, error } = await supabase
          .from('property_changes')
          .select('*', { count: 'exact', head: true });
          
        if (error && error.code === 'PGRST204') {
          console.warn('property_changes table does not exist yet');
          return [];
        }
      } catch (err) {
        console.warn('Error checking if property_changes table exists:', err);
        // Continue anyway
      }
      
      const { data, error } = await supabase
        .from('property_changes')
        .select('*, properties(title)')
        .order('change_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent changes:', error);
        throw error;
      }

      return this.transformPropertyChanges(data);
    } catch (error) {
      console.error('Error in fetchRecentChanges:', error);
      return [];
    }
  },

  /**
   * Transform property changes data to include property title
   * 
   * @param data - Raw property changes data from database
   * @returns Transformed property changes
   */
  transformPropertyChanges(data: any[]): PropertyChange[] {
    if (!data || data.length === 0) return [];
    
    return data.map(change => ({
      ...change,
      property_title: change.properties?.title || 'Unknown Property',
    })) as PropertyChange[];
  },

  /**
   * Fetch property insights
   * 
   * @param propertyId - Optional property ID to filter insights
   * @param limit - Optional limit for the number of insights to fetch
   * @returns Promise with the property insights
   */
  async fetchInsights(propertyId?: string, limit: number = 10): Promise<PropertyInsight[]> {
    try {
      // Check if the property_insights table exists
      try {
        const { count, error } = await supabase
          .from('property_insights')
          .select('*', { count: 'exact', head: true });
          
        if (error && error.code === 'PGRST204') {
          console.warn('property_insights table does not exist yet');
          return [];
        }
      } catch (err) {
        console.warn('Error checking if property_insights table exists:', err);
        // Continue anyway
      }
      
      const query = this.buildInsightsQuery(propertyId, limit);
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching property insights:', error);
        throw error;
      }

      return this.transformPropertyInsights(data);
    } catch (error) {
      console.error('Error in fetchInsights:', error);
      return [];
    }
  },

  /**
   * Build query for fetching property insights
   * 
   * @param propertyId - Optional property ID to filter insights
   * @param limit - Limit for the number of insights to fetch
   * @returns Supabase query
   */
  buildInsightsQuery(propertyId?: string, limit: number = 10) {
    let query = supabase
      .from('property_insights')
      .select('*, properties(title)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    return query;
  },

  /**
   * Transform property insights data to include property title
   * 
   * @param data - Raw property insights data from database
   * @returns Transformed property insights
   */
  transformPropertyInsights(data: any[]): PropertyInsight[] {
    if (!data || data.length === 0) return [];
    
    return data.map(insight => ({
      ...insight,
      property_title: insight.properties?.title || 'Unknown Property',
    })) as PropertyInsight[];
  }
};
