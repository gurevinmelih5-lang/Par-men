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
  console.log("Checking database schema and records...");
  
  // Check Profiles
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log(`\nProfiles count: ${profiles?.length}. Error:`, pErr);
  if (profiles) console.log("Profiles sample:", profiles.map(p => ({ id: p.id, name: p.name })));

  // Check Books
  const { data: books, error: bErr } = await supabase.from('books').select('*');
  console.log(`\nBooks count: ${books?.length}. Error:`, bErr);
  if (books) console.log("Books sample:", books.map(b => ({ id: b.id, title: b.title, owner_id: b.owner_id })));

  // Check Swap Requests
  const { data: swaps, error: sErr } = await supabase.from('swap_requests').select('*');
  console.log(`\nSwap Requests count: ${swaps?.length}. Error:`, sErr);
  if (swaps) console.log("Swap Requests sample:", swaps);
}

run();
