import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function isAdmin() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return false
  
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
    
  return data?.role === 'admin'
}