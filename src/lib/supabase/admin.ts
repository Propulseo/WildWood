import { createClient } from '@supabase/supabase-js'

// Client admin avec service role — usage serveur uniquement
// Ne JAMAIS exposer côté client
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
