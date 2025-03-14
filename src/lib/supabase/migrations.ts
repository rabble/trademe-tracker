/**
 * Utility functions for managing database migrations
 * This is used for development and testing purposes with a remote Supabase instance
 */

import { supabase } from '../supabase';
// Import the RPC type definitions
import './rpc-types';

/**
 * Run a SQL migration script on the remote Supabase instance
 * @param sql The SQL script to execute
 * @returns Promise that resolves when the migration is complete
 */
export async function runMigration(sql: string): Promise<void> {
  try {
    // For security reasons, we only allow this in development
    if (import.meta.env.MODE !== 'development') {
      console.error('Migrations can only be run in development mode');
      return;
    }

    console.log('Running migration on remote Supabase instance...');
    
    // Split the SQL into individual statements for better error handling
    const statements = sql
      .replace(/--.*$/gm, '') // Remove comments
      .split(';')
      .filter(statement => statement.trim().length > 0);
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      // Use type assertion to bypass TypeScript error
      const { error } = await (supabase.rpc as any)('exec_sql', { 
        sql: statement + ';' 
      });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        console.error('Statement:', statement);
        throw error;
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
    throw error;
  }
}

/**
 * Reset the database (for development only)
 * This will drop all tables and recreate them on the remote Supabase instance
 */
export async function resetDatabase(): Promise<void> {
  try {
    // For security reasons, we only allow this in development
    if (import.meta.env.MODE !== 'development') {
      console.error('Database reset can only be run in development mode');
      return;
    }

    console.log('Resetting database on remote Supabase instance...');
    
    // Drop all tables
    const dropTablesSQL = `
      DROP TABLE IF EXISTS public.saved_filters CASCADE;
      DROP TABLE IF EXISTS public.property_insights CASCADE;
      DROP TABLE IF EXISTS public.property_images CASCADE;
      DROP TABLE IF EXISTS public.property_changes CASCADE;
      DROP TABLE IF EXISTS public.properties CASCADE;
    `;
    
    console.log('Dropping existing tables...');
    // Use type assertion to bypass TypeScript error
    const { error: dropError } = await (supabase.rpc as any)('exec_sql', { sql: dropTablesSQL });
    
    if (dropError) {
      console.error('Failed to drop tables:', dropError);
      throw dropError;
    }
    
    console.log('Tables dropped successfully. You should now apply the initial migration.');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}
