import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rbeuxaitxspptplvyaix.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZXV4YWl0eHNwcHRwbHZ5YWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMzQxNzQsImV4cCI6MjEwNTkxMDE3NH0.Z4Cgry4avn72-1ALowcx0bR3KGEfxNhhqi2IJ7gvui8";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZXV4YWl0eHNwcHRwbHZ5YWl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDMzNDE3NCwiZXhwIjoyMTA1OTEwMTc0fQ.a6_X3B21AgIuETFh5tWjgN8HZTo6hcz6h9XNs_zOx9M";

/**
 * Checks whether Supabase is configured with valid environment variables.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith("http") &&
    (supabaseAnonKey || supabaseServiceRoleKey)
  );
}

let publicClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

/**
 * Returns a public (anon) Supabase client for client-side or public read operations.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!publicClient) {
    publicClient = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceRoleKey);
  }
  return publicClient;
}

/**
 * Returns an admin (service-role) Supabase client with elevated permissions for server-side APIs.
 * Falls back to anon key if service role key is not yet configured.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!adminClient) {
    const key = supabaseServiceRoleKey || supabaseAnonKey;
    adminClient = createClient(supabaseUrl, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}
