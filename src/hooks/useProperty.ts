import { useState, useEffect } from 'react';
import { PropertyDbService } from '../services/property/propertyDbService';
import type { Property, PropertyChange, PropertyImage } from '../types';

export function useProperty(propertyId: string | undefined) {
  const [property, setProperty] = useState<Property | null>(null);
  const [changes, setChanges] = useState<PropertyChange[]>([]);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchProperty() {
      if (!propertyId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch property details
        const propertyData = await PropertyDbService.getPropertyById(propertyId);
        
        if (!isMounted) return;
        
        if (propertyData) {
          setProperty(propertyData);
          
          // Fetch property changes
          const changesData = await PropertyDbService.getPropertyChanges(propertyId);
          if (isMounted) {
            setChanges(changesData);
          }
          
          // Fetch property images
          const imagesData = await PropertyDbService.getPropertyImages(propertyId);
          if (isMounted) {
            setImages(imagesData);
          }
        } else {
          setProperty(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching property:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch property'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchProperty();
    
    return () => {
      isMounted = false;
    };
  }, [propertyId]);

  const updateProperty = async (updates: Partial<Property>) => {
    if (!propertyId || !property) return;
    
    try {
      setIsLoading(true);
      const updatedProperty = await PropertyDbService.updateProperty(propertyId, updates);
      setProperty(updatedProperty);
      return updatedProperty;
    } catch (err) {
      console.error('Error updating property:', err);
      setError(err instanceof Error ? err : new Error('Failed to update property'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProperty = async () => {
    if (!propertyId) return;
    
    try {
      setIsLoading(true);
      await PropertyDbService.deleteProperty(propertyId);
      setProperty(null);
    } catch (err) {
      console.error('Error deleting property:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete property'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addImage = async (url: string, isPrimary: boolean = false) => {
    if (!propertyId) return;
    
    try {
      const newImage = await PropertyDbService.addPropertyImage({
        property_id: propertyId,
        url,
        is_primary: isPrimary
      });
      
      setImages(prev => [...prev, newImage]);
      return newImage;
    } catch (err) {
      console.error('Error adding image:', err);
      throw err;
    }
  };

  const setImageAsPrimary = async (imageId: string) => {
    if (!propertyId) return;
    
    try {
      await PropertyDbService.setImageAsPrimary(imageId, propertyId);
      
      // Update local state
      setImages(prev => 
        prev.map(img => ({
          ...img,
          is_primary: img.id === imageId
        }))
      );
    } catch (err) {
      console.error('Error setting image as primary:', err);
      throw err;
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      await PropertyDbService.deletePropertyImage(imageId);
      
      // Update local state
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      console.error('Error deleting image:', err);
      throw err;
    }
  };

  const recordChange = async (
    changeType: 'price' | 'status' | 'description',
    oldValue: string,
    newValue: string,
    description?: string
  ) => {
    if (!propertyId) return;
    
    try {
      const change = await PropertyDbService.recordPropertyChange({
        property_id: propertyId,
        change_type: changeType,
        old_value: oldValue,
        new_value: newValue,
        description
      });
      
      setChanges(prev => [change, ...prev]);
      return change;
    } catch (err) {
      console.error('Error recording change:', err);
      throw err;
    }
  };

  const refetch = async () => {
    if (!propertyId) return;
    
    setIsLoading(true);
    try {
      const propertyData = await PropertyDbService.getPropertyById(propertyId);
      setProperty(propertyData);
      
      const changesData = await PropertyDbService.getPropertyChanges(propertyId);
      setChanges(changesData);
      
      const imagesData = await PropertyDbService.getPropertyImages(propertyId);
      setImages(imagesData);
      
      setError(null);
    } catch (err) {
      console.error('Error refetching property:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch property'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    property,
    changes,
    images,
    isLoading,
    error,
    updateProperty,
    deleteProperty,
    addImage,
    setImageAsPrimary,
    deleteImage,
    recordChange,
    refetch
  };
}
