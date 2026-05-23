import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env manually
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY
);

async function run() {
  console.log("Checking for offered_book_id column in swap_requests...");
  
  // Try querying offered_book_id from swap_requests
  const { data, error } = await supabase
    .from('swap_requests')
    .select('id, offered_book_id')
    .limit(1);
  
  if (error) {
    console.error("Query Error:", error.message, error.code);
  } else {
    console.log("Query Succeeded! Table has offered_book_id column. Data:", data);
  }
}

run();
