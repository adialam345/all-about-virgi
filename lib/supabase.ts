import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabase: ReturnType<typeof createClient> | undefined

export const getSupabase = () => {
  if (supabase) return supabase
  
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'about-virgi-auth'
    }
  })
  
  return supabase
}

export const supabaseClient = getSupabase()