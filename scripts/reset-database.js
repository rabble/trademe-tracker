// Script to reset the database on the remote Supabase instance
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Debug environment variables
console.log('Environment variables:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_SERVICE_ROLE_KEY available:', !!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or service role key not found in environment variables');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Create Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseKey);

// Reset the database
async function resetDatabase() {
  try {
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
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropTablesSQL });
    
    if (dropError) {
      console.error('Failed to drop tables:', dropError);
      throw dropError;
    }
    
    console.log('Tables dropped successfully');
    
    // Apply the initial migration
    const migrationPath = path.resolve(__dirname, '../supabase/migrations/20250314000000_initial_schema.sql');
    console.log(`Applying initial schema from ${migrationPath}...`);
    
    // Read the migration file
    const sql = readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql
      .replace(/--.*$/gm, '') // Remove comments
      .split(';')
      .filter(statement => statement.trim().length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        console.error('Statement:', statement);
        throw error;
      }
    }
    
    console.log('Initial schema applied successfully');
    
    // Apply seed data if available
    try {
      const seedPath = path.resolve(__dirname, '../supabase/seed.sql');
      console.log(`Applying seed data from ${seedPath}...`);
      
      // Read the seed file
      const seedSql = readFileSync(seedPath, 'utf8');
      
      // Split the SQL into individual statements
      const seedStatements = seedSql
        .replace(/--.*$/gm, '') // Remove comments
        .split(';')
        .filter(statement => statement.trim().length > 0);
      
      console.log(`Found ${seedStatements.length} seed SQL statements to execute`);
      
      // Execute each statement separately
      for (let i = 0; i < seedStatements.length; i++) {
        const statement = seedStatements[i].trim();
        console.log(`Executing seed statement ${i + 1}/${seedStatements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          console.error(`Error executing seed statement ${i + 1}:`, error);
          console.error('Statement:', statement);
          // Don't throw error for seed data, just continue
          console.log('Continuing despite seed error...');
        }
      }
      
      console.log('Seed data applied successfully');
    } catch (seedError) {
      console.error('Error applying seed data:', seedError);
      console.log('Continuing despite seed error...');
    }
    
    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
