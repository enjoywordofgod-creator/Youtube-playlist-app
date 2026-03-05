import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://npmksyjxjkrloxzskpv.supabase.co";
const supabaseAnonKey = "sb_publishable_RPEk9A0ngDz8gJXr8beaaA_a15T4enK";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);