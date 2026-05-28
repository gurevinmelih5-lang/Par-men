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
  const profileId = 'bc5c40e1-a6ce-4569-8e19-f5f6c9b13033';
  
  // 1. Fetch current profile
  const { data: pBefore, error: err1 } = await supabase.from('profiles').select('*').eq('id', profileId).single();
  console.log("Before update:", pBefore ? { karma_physical: pBefore.karma_physical } : "not found", err1 ? err1.message : "");

  // 2. Update
  const { data: updateRes, error: err2 } = await supabase
    .from('profiles')
    .update({ karma_physical: (pBefore?.karma_physical || 50) + 1 })
    .eq('id', profileId);
  
  console.log("Update call error:", err2 ? err2.message : "None");

  // 3. Fetch after update
  const { data: pAfter, error: err3 } = await supabase.from('profiles').select('*').eq('id', profileId).single();
  console.log("After update:", pAfter ? { karma_physical: pAfter.karma_physical } : "not found", err3 ? err3.message : "");
}

run();
