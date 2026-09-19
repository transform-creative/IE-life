import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/data/supabase";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "http://localhost:54321";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "placeholder-anon-key";

// Typed with the generated `Database` so `.from("table")` autocompletes and
// row shapes flow through the query wrappers in this folder. Regenerate
// `~/data/supabase.ts` after every schema change.
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);
