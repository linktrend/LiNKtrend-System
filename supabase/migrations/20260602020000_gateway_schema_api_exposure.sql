-- Expose gateway (+ linkaios MVO spine) to PostgREST for Work → Messages and traces.
-- Dashboard "Exposed schemas" should match; this sets authenticator role for hosted Supabase.

ALTER ROLE authenticator SET pgrst.db_schemas =
  'public, graphql_public, linkaios, gateway, bot_runtime, linkbrain, linkskills, linkaios_kernel, linkguard';

NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
