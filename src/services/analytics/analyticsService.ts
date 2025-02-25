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
      // Get counts by status
      const { data: statusCounts, error: statusError } = await supabase
        .from('properties')
        .select('status, count')
        .neq('status', 'archived')
        .group('status');

      if (statusError) {
        throw statusError;
      }

      // Get average price
      const { data: priceData, error: priceError } = await supabase
        .from('properties')
        .select('price')
        .neq('status', 'archived');

      if (priceError) {
        throw priceError;
      }

      // Get average days on market
      const { data: domData, error: domError } = await supabase
        .from('properties')
        .select('days_on_market')
        .neq('status', 'archived');

      if (domError) {
        throw domError;
      }

      // Calculate averages
      const prices = priceData.map(item => item.price);
      const daysOnMarket = domData.map(item => item.days_on_market);
      
      const averagePrice = prices.length > 0 
        ? prices.reduce((sum, price) => sum + price, 0) / prices.length 
        : 0;
        
      const averageDaysOnMarket = daysOnMarket.length > 0 
        ? daysOnMarket.reduce((sum, days) => sum + days, 0) / daysOnMarket.length 
        : 0;

      // Count properties by status
      const activeCount = statusCounts.find(item => item.status === 'active')?.count || 0;
      const underOfferCount = statusCounts.find(item => item.status === 'under_offer')?.count || 0;
      const soldCount = statusCounts.find(item => item.status === 'sold')?.count || 0;
      const totalCount = activeCount + underOfferCount + soldCount;

      return {
        totalProperties: totalCount,
        activeProperties: activeCount,
        underOfferProperties: underOfferCount,
        soldProperties: soldCount,
        averagePrice,
        averageDaysOnMarket
      };
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
      throw error;
    }
  },

  /**
   * Fetch recent property changes
   * 
   * @param limit - Optional limit for the number of changes to fetch
   * @returns Promise with the recent property changes
   */
  async fetchRecentChanges(limit: number = 10): Promise<PropertyChange[]> {
    try {
      const { data, error } = await supabase
        .from('property_changes')
        .select('*, properties(title)')
        .order('change_date', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      // Transform the data to include property title
      return data.map(change => ({
        ...change,
        property_title: change.properties.title,
      })) as PropertyChange[];
    } catch (error) {
      console.error('Error fetching recent changes:', error);
      throw error;
    }
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
      let query = supabase
        .from('property_insights')
        .select('*, properties(title)')
        .order('created_at', { ascending: false });

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query.limit(limit);

      if (error) {
        throw error;
      }

      // Transform the data to include property title
      return data.map(insight => ({
        ...insight,
        property_title: insight.properties.title,
      })) as PropertyInsight[];
    } catch (error) {
      console.error('Error fetching property insights:', error);
      throw error;
    }
  }
};
