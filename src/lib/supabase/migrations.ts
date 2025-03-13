/**
 * Utility functions for managing database migrations
 * This is used for development and testing purposes
 */

import { supabase } from '../supabase';

/**
 * Run a SQL migration script
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

    console.log('Running migration...');
    
    // Execute the SQL script
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Migration failed:', error);
      throw error;
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
    throw error;
  }
}

/**
 * Reset the database (for development only)
 * This will drop all tables and recreate them
 */
export async function resetDatabase(): Promise<void> {
  try {
    // For security reasons, we only allow this in development
    if (import.meta.env.MODE !== 'development') {
      console.error('Database reset can only be run in development mode');
      return;
    }

    console.log('Resetting database...');
    
    // Drop all tables
    const dropTablesSQL = `
      DROP TABLE IF EXISTS public.saved_filters CASCADE;
      DROP TABLE IF EXISTS public.property_insights CASCADE;
      DROP TABLE IF EXISTS public.property_images CASCADE;
      DROP TABLE IF EXISTS public.property_changes CASCADE;
      DROP TABLE IF EXISTS public.properties CASCADE;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropTablesSQL });
    
    if (dropError) {
      console.error('Failed to drop tables:', dropError);
      throw dropError;
    }
    
    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}
