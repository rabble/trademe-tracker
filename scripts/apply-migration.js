// Script to apply migrations to the remote Supabase instance
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

// Get migration file from command line arguments
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Error: No migration file specified');
  console.error('Usage: node scripts/apply-migration.js <migration-file>');
  console.error('Example: node scripts/apply-migration.js 20250314000000_initial_schema.sql');
  process.exit(1);
}

// Resolve the migration file path
const migrationPath = path.resolve(__dirname, '../supabase/migrations', migrationFile);

// Apply the migration
async function applyMigration() {
  try {
    console.log(`Applying migration from ${migrationPath}...`);
    
    // Read the migration file
    const sql = readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql
      .replace(/--.*$/gm, '') // Remove comments
      .split(';')
      .filter(statement => statement.trim().length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Create a _migrations table if it doesn't exist
    try {
      await supabase.rpc('pg_execute', { 
        query: `
          CREATE TABLE IF NOT EXISTS public._migrations (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            hash TEXT
          )
        `
      });
    } catch (err) {
      console.log('Note: Could not create _migrations table:', err.message);
      // Continue anyway
    }
    
    // Execute each statement separately using pg_execute RPC
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('pg_execute', { query: statement });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          console.error('Statement:', statement);
          throw error;
        }
      } catch (err) {
        // If pg_execute doesn't exist, we'll get an error
        if (err.message && err.message.includes('pg_execute')) {
          console.error('The pg_execute function does not exist in your Supabase instance.');
          console.error('Please run this SQL in the Supabase SQL Editor to create it:');
          console.error(`
CREATE OR REPLACE FUNCTION pg_execute(query text)
RETURNS VOID AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
          `);
          throw new Error('Missing pg_execute function. See instructions above.');
        } else {
          throw err;
        }
      }
    }
    
    // Record the migration
    try {
      await supabase.rpc('pg_execute', { 
        query: `
          INSERT INTO public._migrations (name, hash)
          VALUES ('${migrationFile}', 'manual-migration')
        `
      });
      console.log('Migration recorded in _migrations table');
    } catch (err) {
      console.log('Note: Could not record migration:', err.message);
      // Continue anyway
    }
    
    console.log('Migration applied successfully');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration();
