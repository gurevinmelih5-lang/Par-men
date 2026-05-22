import { supabase } from './src/lib/supabase';

async function test() {
  const { data, error } = await supabase
    .from('scriptums')
    .select(`
      *,
      profiles:user_id(name, avatar_url),
      scriptum_replies(*, profiles:user_id(name, avatar_url))
    `)
    .limit(1);
    
  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

test();
