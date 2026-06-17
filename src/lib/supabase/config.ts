/**
 * Whether real Supabase credentials are present. Until the user pastes their own
 * project's URL + anon key into .env.local, the app runs in "preview mode":
 * reads return mock data and auth is bypassed, so the UI is fully browsable
 * without touching any database.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigured =
  SUPABASE_URL.length > 0 &&
  SUPABASE_ANON_KEY.length > 0 &&
  !SUPABASE_URL.includes("YOUR-PROJECT") &&
  !SUPABASE_ANON_KEY.includes("YOUR-ANON");
