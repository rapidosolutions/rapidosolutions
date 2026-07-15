import { createClient } from "@supabase/supabase-js";

let client = null;
let ready = false;

export async function connectDatabase({ supabaseUrl, supabaseServiceRoleKey }) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  client = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });

  const { error } = await client.from("admins").select("id").limit(1);
  if (error) {
    throw new Error(`Supabase connection check failed. Run the database migration first. ${error.message}`);
  }

  ready = true;
  return client;
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
