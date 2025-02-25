import { supabase } from '../../lib/supabase'
import { Property } from '../../types'

/**
 * Interface for property filters
 */
export interface PropertyFilters {
  status?: 'active' | 'under_offer' | 'sold' | 'archived';
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  searchQuery?: string;
}

/**
 * Interface for pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Service for interacting with property data in the database
 */
export const PropertyService = {
  /**
   * Fetch properties with optional filtering and pagination
   * 
   * @param filters - Optional filters to apply to the query
   * @param pagination - Optional pagination options
   * @returns Promise with properties and count
   */
  async fetchProperties(
    filters?: PropertyFilters,
    pagination?: PaginationOptions
  ): Promise<{ data: Property[]; count: number }> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const startIndex = (page - 1) * limit;

      // Start building the query
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' });

      // Apply filters if provided
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status);
        } else {
          // By default, don't show archived properties
          query = query.neq('status', 'archived');
        }

        if (filters.minPrice) {
          query = query.gte('price', filters.minPrice);
        }

        if (filters.maxPrice) {
          query = query.lte('price', filters.maxPrice);
        }

        if (filters.bedrooms) {
          query = query.eq('bedrooms', filters.bedrooms);
        }

        if (filters.bathrooms) {
          query = query.eq('bathrooms', filters.bathrooms);
        }

        if (filters.searchQuery) {
          query = query.or(
            `title.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%`
          );
        }
      } else {
        // By default, don't show archived properties
        query = query.neq('status', 'archived');
      }

      // Apply pagination
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(startIndex, startIndex + limit - 1);

      if (error) {
        throw error;
      }

      return {
        data: data as Property[],
        count: count || 0,
      };
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  /**
   * Fetch a single property by ID
   * 
   * @param id - The property ID
   * @returns Promise with the property data
   */
  async fetchPropertyById(id: string): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(`Property with ID ${id} not found`);
      }

      return data as Property;
    } catch (error) {
      console.error(`Error fetching property with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update a property
   * 
   * @param id - The property ID
   * @param data - The data to update
   * @returns Promise with the updated property
   */
  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    try {
      const { data: updatedProperty, error } = await supabase
        .from('properties')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return updatedProperty as Property;
    } catch (error) {
      console.error(`Error updating property with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Archive a property (mark as archived)
   * 
   * @param id - The property ID
   * @returns Promise with the archived property
   */
  async archiveProperty(id: string): Promise<Property> {
    try {
      const { data: archivedProperty, error } = await supabase
        .from('properties')
        .update({ status: 'archived' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return archivedProperty as Property;
    } catch (error) {
      console.error(`Error archiving property with ID ${id}:`, error);
      throw error;
    }
  }
};
