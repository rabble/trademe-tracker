import { supabase } from '../../lib/supabase'
import { Property } from '../../types'
import { sampleProperties } from '../../data/sampleProperties'

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
      // Use sample data instead of Supabase query
      let filteredProperties = [...sampleProperties];

      // Apply filters if provided
      if (filters) {
        if (filters.status) {
          filteredProperties = filteredProperties.filter(p => p.status === filters.status);
        } else {
          // By default, don't show archived properties
          filteredProperties = filteredProperties.filter(p => p.status !== 'archived');
        }

        if (filters.minPrice) {
          filteredProperties = filteredProperties.filter(p => p.price >= filters.minPrice);
        }

        if (filters.maxPrice) {
          filteredProperties = filteredProperties.filter(p => p.price <= filters.maxPrice);
        }

        if (filters.bedrooms) {
          filteredProperties = filteredProperties.filter(p => p.bedrooms === filters.bedrooms);
        }

        if (filters.bathrooms) {
          filteredProperties = filteredProperties.filter(p => p.bathrooms === filters.bathrooms);
        }

        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredProperties = filteredProperties.filter(p => 
            p.title.toLowerCase().includes(query) || 
            p.address.toLowerCase().includes(query)
          );
        }
      } else {
        // By default, don't show archived properties
        filteredProperties = filteredProperties.filter(p => p.status !== 'archived');
      }

      // Sort by created_at descending
      filteredProperties.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Get total count before pagination
      const count = filteredProperties.length;
      
      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const startIndex = (page - 1) * limit;
      const data = filteredProperties.slice(startIndex, startIndex + limit);

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
      const property = sampleProperties.find(p => p.id === id);
      
      if (!property) {
        throw new Error(`Property with ID ${id} not found`);
      }

      return property;
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
      // Find the property in our sample data
      const propertyIndex = sampleProperties.findIndex(p => p.id === id);
      
      if (propertyIndex === -1) {
        throw new Error(`Property with ID ${id} not found`);
      }
      
      // Update the property (in a real app, this would persist to the database)
      const updatedProperty = {
        ...sampleProperties[propertyIndex],
        ...data
      };
      
      // In a real app, we would save this back to the database
      // For now, just return the updated property
      return updatedProperty;
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
      // Find the property in our sample data
      const propertyIndex = sampleProperties.findIndex(p => p.id === id);
      
      if (propertyIndex === -1) {
        throw new Error(`Property with ID ${id} not found`);
      }
      
      // Update the property status to archived
      const archivedProperty = {
        ...sampleProperties[propertyIndex],
        status: 'archived' as const
      };
      
      // In a real app, we would save this back to the database
      // For now, just return the archived property
      return archivedProperty;
    } catch (error) {
      console.error(`Error archiving property with ID ${id}:`, error);
      throw error;
    }
  }
};
