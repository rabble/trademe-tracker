/**
 * TypeScript definitions for Supabase database schema
 * These types are generated based on our database schema
 * and used for type-safe database operations
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          title: string
          address: string
          price: number
          bedrooms: number | null
          bathrooms: number | null
          status: 'active' | 'under_offer' | 'sold' | 'archived'
          days_on_market: number
          created_at: string
          updated_at: string
          trademe_listing_id: string | null
          url: string | null
          image_urls: string[] | null
          description: string | null
          user_notes: string | null
          land_area: number | null
          floor_area: number | null
          property_type: 'house' | 'apartment' | 'townhouse' | 'section' | 'other' | null
          primary_image_url: string | null
          latitude: number | null
          longitude: number | null
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          address: string
          price: number
          bedrooms?: number | null
          bathrooms?: number | null
          status: 'active' | 'under_offer' | 'sold' | 'archived'
          days_on_market?: number
          created_at?: string
          updated_at?: string
          trademe_listing_id?: string | null
          url?: string | null
          image_urls?: string[] | null
          description?: string | null
          user_notes?: string | null
          land_area?: number | null
          floor_area?: number | null
          property_type?: 'house' | 'apartment' | 'townhouse' | 'section' | 'other' | null
          primary_image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          address?: string
          price?: number
          bedrooms?: number | null
          bathrooms?: number | null
          status?: 'active' | 'under_offer' | 'sold' | 'archived'
          days_on_market?: number
          created_at?: string
          updated_at?: string
          trademe_listing_id?: string | null
          url?: string | null
          image_urls?: string[] | null
          description?: string | null
          user_notes?: string | null
          land_area?: number | null
          floor_area?: number | null
          property_type?: 'house' | 'apartment' | 'townhouse' | 'section' | 'other' | null
          primary_image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      property_changes: {
        Row: {
          id: string
          property_id: string
          change_type: 'price' | 'status' | 'description'
          old_value: string
          new_value: string
          change_date: string
          description: string | null
        }
        Insert: {
          id?: string
          property_id: string
          change_type: 'price' | 'status' | 'description'
          old_value: string
          new_value: string
          change_date?: string
          description?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          change_type?: 'price' | 'status' | 'description'
          old_value?: string
          new_value?: string
          change_date?: string
          description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_changes_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          url: string
          is_primary: boolean
          created_at: string
          hash: string | null
          size: number | null
          width: number | null
          height: number | null
        }
        Insert: {
          id?: string
          property_id: string
          url: string
          is_primary?: boolean
          created_at?: string
          hash?: string | null
          size?: number | null
          width?: number | null
          height?: number | null
        }
        Update: {
          id?: string
          property_id?: string
          url?: string
          is_primary?: boolean
          created_at?: string
          hash?: string | null
          size?: number | null
          width?: number | null
          height?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      property_insights: {
        Row: {
          id: string
          property_id: string
          insight_type: 'price_trend' | 'market_comparison' | 'recommendation'
          insight_text: string
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          insight_type: 'price_trend' | 'market_comparison' | 'recommendation'
          insight_text: string
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          insight_type?: 'price_trend' | 'market_comparison' | 'recommendation'
          insight_text?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_insights_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      saved_filters: {
        Row: {
          id: string
          user_id: string
          name: string
          filters: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          filters: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          filters?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_filters_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
