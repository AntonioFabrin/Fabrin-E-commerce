import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const isSupabaseStorageConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseStorageConfigured
    ? createClient(supabaseUrl as string, supabaseKey as string, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    })
    : null;
