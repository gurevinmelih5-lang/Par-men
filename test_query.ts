import { supabase } from './src/lib/supabase';

async function test() {
  console.log("Testing inserting scriptum with null book_id...");
  const { data, error } = await supabase
    .from('scriptums')
    .insert({
      user_id: '864273bb-50b3-4654-944a-d6e32d3989c4', // Melih Gurevin's ID or any valid user id from DB
      content: 'Kitap secmeden paylasilan deneme metni.',
      book_id: null
    })
    .select();

  console.log("Insert Error:", error);
  console.log("Insert Data:", data);
}

test();

