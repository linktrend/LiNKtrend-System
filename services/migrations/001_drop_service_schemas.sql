-- LiNKtrend service schemas reset (safe: does not touch auth, storage, or extensions).
-- Run after backup if you ever have data you care about.

DROP SCHEMA IF EXISTS gateway CASCADE;
DROP SCHEMA IF EXISTS prism CASCADE;
DROP SCHEMA IF EXISTS bot_runtime CASCADE;
DROP SCHEMA IF EXISTS linkaios CASCADE;
