import { createClient } from "@supabase/supabase-js";

let client = null;
let ready = false;

export async function connectDatabase({ supabaseUrl, supabaseServiceRoleKey }) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn("[Database Warning] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured. Running in degraded mode.");
    ready = false;
    return null;
  }

  try {
    client = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false
      }
    });

    const { error } = await client.from("admins").select("id").limit(1);
    if (error) {
      console.warn(`[Database Warning] Supabase connection check failed (${error.message}). Operating in degraded mode.`);
      ready = false;
      return client;
    }

    ready = true;
    return client;
  } catch (err) {
    console.warn(`[Database Warning] Failed to initialize Supabase client: ${err.message}. Operating in degraded mode.`);
    ready = false;
    return null;
  }
}

export function getDatabase() {
  if (!client) throw new Error("Supabase has not been initialized.");
  return client;
}

export async function disconnectDatabase() {
  client = null;
  ready = false;
}

export function databaseStatus() {
  return ready;
}
