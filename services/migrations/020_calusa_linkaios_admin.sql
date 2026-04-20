-- Grant admin role in LiNKaios command centre for calusa@linktrend.media (optional row in linkaios.user_access).

INSERT INTO linkaios.user_access (user_id, role)
SELECT u.id, 'admin'::text
FROM auth.users u
WHERE lower(u.email) = lower('calusa@linktrend.media')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
