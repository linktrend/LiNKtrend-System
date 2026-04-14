-- PostgREST / Data API access for custom schemas (see Supabase docs: Using custom schemas).
-- Also add linkaios, bot_runtime, prism, gateway to "Exposed schemas" in Dashboard → Settings → API.

GRANT USAGE ON SCHEMA linkaios TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA linkaios TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA linkaios TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA linkaios TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA linkaios GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA linkaios GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA linkaios GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

GRANT USAGE ON SCHEMA bot_runtime TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA bot_runtime TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA bot_runtime TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA bot_runtime TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA bot_runtime GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA bot_runtime GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA bot_runtime GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

GRANT USAGE ON SCHEMA prism TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA prism TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA prism TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA prism TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA prism GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA prism GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA prism GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

GRANT USAGE ON SCHEMA gateway TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA gateway TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA gateway TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA gateway TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA gateway GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA gateway GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA gateway GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
