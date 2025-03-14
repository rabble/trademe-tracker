import { supabase } from '../../lib/supabase'

/**
 * Interface for property image
 */
export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
}

/**
 * Interface for historical image
 */
export interface HistoricalImage extends PropertyImage {
  captured_at: string;
}

/**
 * Service for interacting with property images in the database
 */
export const ImageService = {
  /**
   * Fetch all images for a property
   * 
   * @param propertyId - The property ID
   * @returns Promise with the property images
   */
  async fetchPropertyImages(propertyId: string): Promise<PropertyImage[]> {
    try {
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('is_primary', { ascending: false });

      if (error) {
        throw error;
      }

      return data as PropertyImage[];
    } catch (error) {
      console.error(`Error fetching images for property ${propertyId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch historical images for a property
   * 
   * @param propertyId - The property ID
   * @returns Promise with the historical images
   */
  async fetchImageHistory(propertyId: string): Promise<HistoricalImage[]> {
    try {
      // Check if the historical_images table exists
      try {
        const { count, error: checkError } = await supabase
          .from('historical_images')
          .select('*', { count: 'exact', head: true });
          
        if (checkError && checkError.code === 'PGRST204') {
          console.warn('historical_images table does not exist yet');
          return [];
        }
      } catch (err) {
        console.warn('Error checking if historical_images table exists:', err);
        // Continue anyway
      }
      
      const { data, error } = await supabase
        .from('historical_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('captured_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Use proper type assertion with unknown intermediate step
      return (data as unknown) as HistoricalImage[];
    } catch (error) {
      console.error(`Error fetching image history for property ${propertyId}:`, error);
      throw error;
    }
  }
};
