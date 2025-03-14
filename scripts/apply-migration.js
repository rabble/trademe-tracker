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
    
    // Execute the entire SQL script at once
    console.log('Executing SQL migration...');
    
    const { error } = await supabase.from('_migrations')
      .insert({
        name: migrationFile,
        executed_at: new Date().toISOString(),
        hash: 'manual-migration'
      });
    
    if (error && error.code !== '42P01') { // Ignore error if _migrations table doesn't exist yet
      console.error('Error recording migration:', error);
      // Continue anyway
    }
    
    // Use the REST API to execute the SQL directly
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        query: sql
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error executing SQL:', errorData);
      throw new Error(`Failed to execute SQL: ${response.status} ${response.statusText}`);
    }
    
    console.log('Migration applied successfully');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration();
