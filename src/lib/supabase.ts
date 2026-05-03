import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL') {
  console.warn('Supabase credentials are not set. The app will not connect to the database.');
}

export const supabase = createClient(
  supabaseUrl || 'http://placeholder.url',
  supabaseAnonKey || 'placeholder-key'
);
