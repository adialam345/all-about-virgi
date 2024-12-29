import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Export direct instance instead of getter
export const supabase = createClientComponentClient<Database>()