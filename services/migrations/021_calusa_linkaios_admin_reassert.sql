-- Re-assert command-centre admin for calusa@linktrend.media.
-- Use when linkaios.user_access has role operator (or migration 020 ran before this user existed).

INSERT INTO linkaios.user_access (user_id, role)
SELECT u.id, 'admin'::text
FROM auth.users u
WHERE lower(u.email) = lower('calusa@linktrend.media')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
