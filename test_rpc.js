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
  console.log("Checking if RPC function execute_two_way_book_swap exists...");
  
  // Call execute_two_way_book_swap with a dummy UUID
  const dummyUUID = 'd3b07384-d113-4e1b-b5c9-9430c4f826a7';
  const { error } = await supabase.rpc('execute_two_way_book_swap', {
    p_swap_request_id: dummyUUID,
    p_offered_book_id: dummyUUID,
    p_owner_city: 'İstanbul',
    p_requester_city: 'Ankara',
    p_date: 'Mayıs 2026'
  });
  
  if (error) {
    console.log("RPC Call returned error:", error.message, "Code:", error.code);
  } else {
    console.log("RPC Call completed successfully (unexpected if UUID is dummy).");
  }
}

run();
