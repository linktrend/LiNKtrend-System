import 'dotenv/config';
import { getSupabaseAdmin } from '../packages/db/src/index';

console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
