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
  console.log("Simulating two-way swap approval...");

  const bookAId = '33333333-3333-3333-3333-333333333333'; // 1984 (originally owned by Caner)
  const bookBId = '44444444-4444-4444-4444-444444444444'; // Otostopçunun Galaksi Rehberi (originally owned by Elif)
  const canerId = '11111111-1111-1111-1111-111111111111'; // Owner of Book A
  const elifId = '22222222-2222-2222-2222-222222222222';  // Requester (owner of Book B)

  // 1. Create a pending swap request
  const { data: request, error: insErr } = await supabase
    .from('swap_requests')
    .insert({
      book_id: bookAId,
      requester_id: elifId,
      owner_id: canerId,
      status: 'pending'
    })
    .select()
    .single();

  if (insErr) {
    console.error("Failed to insert test swap request:", insErr);
    return;
  }

  console.log("Inserted test swap request:", request.id);

  // 2. Call the RPC function execute_two_way_book_swap
  console.log("Calling execute_two_way_book_swap RPC...");
  const { error: rpcErr } = await supabase.rpc('execute_two_way_book_swap', {
    p_swap_request_id: request.id,
    p_offered_book_id: bookBId,
    p_owner_city: 'İstanbul',
    p_requester_city: 'Ankara',
    p_date: 'Mayıs 2026'
  });

  if (rpcErr) {
    console.error("RPC Error:", rpcErr.message, rpcErr.code);
  } else {
    console.log("RPC call completed with no error!");
    
    // Check request status
    const { data: updatedRequest } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('id', request.id)
      .single();
    console.log("Updated Swap Request status:", updatedRequest?.status);

    // Check book owners
    const { data: books } = await supabase
      .from('books')
      .select('id, title, owner_id')
      .in('id', [bookAId, bookBId]);
    console.log("Books owners after swap:", books);
  }

  // 3. Clean up
  console.log("Cleaning up...");
  await supabase.from('swap_requests').delete().eq('id', request.id);
  
  // Restore original owners
  await supabase.from('books').update({ owner_id: canerId }).eq('id', bookAId);
  await supabase.from('books').update({ owner_id: elifId }).eq('id', bookBId);
  
  console.log("Cleanup complete!");
}

run();
