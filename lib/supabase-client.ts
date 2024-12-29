import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

class SupabaseClient {
  private static instance: ReturnType<typeof createClient>

  public static getInstance() {
    if (!SupabaseClient.instance) {
      SupabaseClient.instance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      })
    }
    return SupabaseClient.instance
  }
}

export const supabase = SupabaseClient.getInstance() 