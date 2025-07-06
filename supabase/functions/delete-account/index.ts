
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Shared CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reason } = await req.json()
    console.log('Account deletion requested with reason:', reason)

    // Create a Supabase client with the Auth context of the user that called the function.
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get user from the token.
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError) throw userError
    if (!user) throw new Error("User not found.")

    // Create admin client to perform privileged operations.
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Call the RPC function to delete associated data in public tables.
    const { error: rpcError } = await userClient.rpc('delete_user_data')
    if (rpcError) {
      console.error('Error from delete_user_data RPC:', rpcError)
      throw new Error(`Failed to delete user data: ${rpcError.message}`)
    }
    console.log(`Successfully deleted data for user ${user.id}`)

    // 2. Delete the user from the auth.users table.
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)
      throw new Error(`Failed to delete auth user: ${deleteError.message}`)
    }
    console.log(`Successfully deleted auth user ${user.id}`)

    // NOTE: Sending a confirmation email has been omitted for now.
    // This requires a RESEND_API_KEY, which can be configured later to complete the feature.

    return new Response(JSON.stringify({ message: 'Account deleted successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('An unexpected error occurred:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
