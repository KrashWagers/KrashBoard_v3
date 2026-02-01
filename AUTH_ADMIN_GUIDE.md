# Auth & Admin Guide

This project uses Supabase auth with a `user_profiles` table to store roles.

## Public vs Protected
- Public: `/`
- Protected: all other routes
- Admin-only: any route under `/admin`

## Making a route admin-only
1) Create the page under `/admin/...`
2) Middleware blocks non-admin users automatically

## Making a feature admin-only (UI)
Hide admin-only UI unless the role is `admin`.
Use Supabase to fetch the current user's role from `user_profiles`.

## Updating your role
Run this in Supabase SQL Editor:
```
insert into public.user_profiles (user_id, role)
select id, 'admin'
from auth.users
where email = 'you@email.com'
on conflict (user_id) do update set role = 'admin';
```

## Notes
- The `role` value is either `admin` or `user`
- `user_profiles.user_id` is linked to `auth.users.id`
- RLS policies allow users to read their own profile
