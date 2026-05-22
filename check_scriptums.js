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
  console.log("Checking scriptums insertion with null book_id...");
  
  // Find a valid user_id
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  if (profileError || !profiles || profiles.length === 0) {
    console.error("Profile query error:", profileError);
    return;
  }

  const userId = profiles[0].id;
  console.log("Using user ID:", userId);

  // Insert a test scriptum
  const { data, error } = await supabase
    .from('scriptums')
    .insert({
      user_id: userId,
      content: 'Kitap secilmeden paylasilan deneme metni.',
      book_id: null
    })
    .select();

  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("Successfully inserted scriptum without book:", data);
    
    // Clean up
    const { error: deleteError } = await supabase
      .from('scriptums')
      .delete()
      .eq('id', data[0].id);
      
    if (deleteError) {
      console.error("Cleanup error:", deleteError);
    } else {
      console.log("Cleaned up test scriptum successfully.");
    }
  }
}

run();

