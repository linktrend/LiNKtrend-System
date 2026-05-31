# Operator roles (RLS)

Migration **`010_operator_roles_rls.sql`** introduces **`linkaios.user_access`**:

| Column     | Meaning                                      |
| ---------- | -------------------------------------------- |
| `user_id`  | `auth.users.id` (Supabase Auth)              |
| `role`     | `admin`, `operator`, or `viewer`             |

## Defaults

- **No row** for a user: treated as **`operator`** for command-plane writes (same as pre-010 behaviour).
- **`viewer`**: `SELECT` allowed on command-plane tables; **no** `INSERT`/`UPDATE`/`DELETE` on `linkaios`, `bot_runtime`, `prism`, or `gateway` data (except `user_access`, where users may only read their own row).

## Admin vs operator

Both **`admin`** and **`operator`** satisfy `linkaios.command_centre_write_allowed()`. You can use **`admin`** for future finer-grained rules.

## Seeding roles

Insert into `linkaios.user_access` with the Supabase SQL editor (service role) or a trusted admin tool, for example:

```sql
insert into linkaios.user_access (user_id, role)
values ('<uuid-from-auth.users>', 'viewer')
on conflict (user_id) do update set role = excluded.role;
```
