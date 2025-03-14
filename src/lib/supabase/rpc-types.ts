/**
 * Type definitions for custom RPC functions in Supabase
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './schema';

// Extend the SupabaseClient type to include our custom RPC functions
declare module '@supabase/supabase-js' {
  interface SupabaseClient<T extends Database = any> {
    rpc<R extends Record<string, unknown> = Record<string, unknown>>(
      fn: 'exec_sql',
      params: { sql: string }
    ): Promise<{ data: R; error: null } | { data: null; error: any }>;
    
    rpc<R extends Record<string, unknown> = Record<string, unknown>>(
      fn: 'get_public_tables',
      params?: {}
    ): Promise<{ data: Array<{ table_name: string }>; error: null } | { data: null; error: any }>;
    
    rpc<R extends Record<string, unknown> = Record<string, unknown>>(
      fn: 'pg_execute',
      params: { query: string }
    ): Promise<{ data: R; error: null } | { data: null; error: any }>;
    
    rpc<R extends Record<string, unknown> = Record<string, unknown>>(
      fn: 'get_property_stats',
      params?: {}
    ): Promise<{ 
      data: { 
        totalValue: number; 
        avgPrice: number; 
        avgDaysOnMarket: number 
      }; 
      error: null 
    } | { data: null; error: any }>;
  }
}
