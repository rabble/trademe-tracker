/**
 * Type definitions for custom RPC functions in Supabase
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './schema';

// Make sure this file is imported somewhere to apply the type extensions
// This is a no-op export to ensure the file is included in the build
export const __ENSURE_IMPORT = true;

// Extend the SupabaseClient type to include our custom RPC functions
declare module '@supabase/supabase-js' {
  // Use a simpler type declaration that's compatible with the original
  interface SupabaseClient {
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
    
    rpc<R = void>(
      fn: 'merge_temp_user_data',
      params: { 
        p_temp_user_id: string;
        p_permanent_user_id: string;
      }
    ): Promise<{ data: R; error: null } | { data: null; error: any }>;
    
    rpc<R = void>(
      fn: 'set_temp_user_id',
      params: { 
        p_temp_user_id: string;
      }
    ): Promise<{ data: R; error: null } | { data: null; error: any }>;
  }
}
