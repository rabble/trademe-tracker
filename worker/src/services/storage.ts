import { Env } from '../index';
import { PropertyImage } from '../types';

// Interface for image metadata
export interface ImageMetadata {
  id: string;
  property_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
  hash?: string; // Used for change detection
  size?: number;
  width?: number;
  height?: number;
  format?: string;
}

export class StorageService {
  private supabaseUrl: string;
  private supabaseKey: string;
  private bucketName: string;

  constructor(env: Env) {
    this.supabaseUrl = env.SUPABASE_URL;
    this.supabaseKey = env.SUPABASE_ANON_KEY;
    this.bucketName = env.SUPABASE_STORAGE_BUCKET || 'property-images';
  }

  /**
   * Process and store property images
   * 
   * @param propertyId - The property ID
   * @param images - Array of property images
   * @returns Promise with processed image metadata
   */
  async processPropertyImages(propertyId: string, images: PropertyImage[]): Promise<ImageMetadata[]> {
    try {
      console.log(`Processing ${images.length} images for property ${propertyId}`);
      
      // Get existing images for this property
      const existingImages = await this.getPropertyImages(propertyId);
      const existingImageMap = new Map(existingImages.map(img => [img.url, img]));
      
      const processedImages: ImageMetadata[] = [];
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Process images in chunks to avoid overwhelming the worker
      const chunkSize = 3; // Process 3 images at a time
      for (let i = 0; i < images.length; i += chunkSize) {
        const chunk = images.slice(i, i + chunkSize);
        
        // Process chunk in parallel
        const chunkPromises = chunk.map(async (image, index) => {
          const imageNumber = i + index;
          try {
            // Check if image already exists and hasn't changed
            if (existingImageMap.has(image.url)) {
              const existingImage = existingImageMap.get(image.url)!;
              
              // If we already have this image, just return its metadata
              console.log(`Image ${image.url} already exists, skipping download`);
              return existingImage;
            }
            
            // Download the image
            const imageResponse = await fetch(image.url);
            if (!imageResponse.ok) {
              throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`);
            }
            
            // Get image data
            const imageData = await imageResponse.arrayBuffer();
            const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
            
            // Calculate image hash for change detection
            const imageHash = await this.calculateHash(imageData);
            
            // Create path in storage
            const path = `${propertyId}/${date}/${imageNumber.toString().padStart(3, '0')}`;
            const filename = this.getFilenameFromUrl(image.url, contentType);
            const fullPath = `${path}/${filename}`;
            
            // Upload to Supabase Storage
            await this.uploadToStorage(fullPath, imageData, contentType);
            
            // Create metadata
            const metadata: ImageMetadata = {
              ...image,
              hash: imageHash,
              size: imageData.byteLength,
              format: contentType.split('/')[1],
            };
            
            return metadata;
          } catch (error) {
            console.error(`Error processing image ${image.url}:`, error);
            // Return basic metadata even if processing failed
            return image;
          }
        });
        
        // Wait for all images in this chunk to be processed
        const chunkResults = await Promise.all(chunkPromises);
        processedImages.push(...chunkResults);
        
        // Add a small delay between chunks to avoid rate limiting
        if (i + chunkSize < images.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Store the updated image metadata
      await this.storeImageMetadata(propertyId, processedImages);
      
      return processedImages;
    } catch (error) {
      console.error(`Error processing images for property ${propertyId}:`, error);
      return images; // Return original images if processing fails
    }
  }
  
  /**
   * Get existing images for a property
   */
  private async getPropertyImages(propertyId: string): Promise<ImageMetadata[]> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/property_images?property_id=eq.${propertyId}`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get property images: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting property images:`, error);
      return [];
    }
  }
  
  /**
   * Store image metadata in Supabase
   */
  private async storeImageMetadata(propertyId: string, images: ImageMetadata[]): Promise<void> {
    try {
      // Use upsert to insert or update
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/property_images`,
        {
          method: 'POST',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify(images),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to store image metadata: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error storing image metadata:`, error);
    }
  }
  
  /**
   * Upload file to Supabase Storage
   */
  private async uploadToStorage(path: string, data: ArrayBuffer, contentType: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${path}`,
        {
          method: 'POST',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': contentType,
            'Cache-Control': 'max-age=31536000',
          },
          body: data,
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to upload to storage: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error uploading to storage:`, error);
      throw error;
    }
  }
  
  /**
   * Calculate a hash for an image buffer
   */
  private async calculateHash(buffer: ArrayBuffer): Promise<string> {
    // Use SubtleCrypto for hashing
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    
    // Convert to hex string
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  /**
   * Extract filename from URL
   */
  private getFilenameFromUrl(url: string, contentType: string): string {
    try {
      // Try to get filename from URL
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();
      
      if (filename && filename.includes('.')) {
        return filename;
      }
      
      // If no valid filename, generate one based on content type
      const extension = contentType.split('/')[1] || 'jpg';
      return `image.${extension}`;
    } catch (error) {
      // Default filename if URL parsing fails
      return `image.jpg`;
    }
  }
}
