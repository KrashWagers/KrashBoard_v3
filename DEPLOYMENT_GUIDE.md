# Deployment Guide - Finding Supabase Credentials

## Where to Find Supabase Credentials

### Method 1: From Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Visit [https://supabase.com](https://supabase.com)
   - Sign in to your account

2. **Select Your Project**
   - Click on your project (or create a new one if needed)

3. **Navigate to API Settings**
   - Click on the gear icon (⚙️) in the left sidebar
   - Select "API" from the settings menu

4. **Find Your Credentials**
   You'll see a section called "Project API keys" with:
   
   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
     - Example: `https://xxxxxxxxxxxxx.supabase.co`
   
   - **anon public** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Click the "eye" icon to reveal it
     - Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   
   - **service_role secret** key → This is your `SUPABASE_SERVICE_ROLE_KEY`
     - ⚠️ **WARNING**: This is a secret key - never expose it publicly
     - Click the "eye" icon to reveal it
     - Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Method 2: From Vercel v2 Project (If Already Configured)

If you already have KrashBoard v2 deployed:

1. **Go to Vercel Dashboard**
   - Visit [https://vercel.com](https://vercel.com)
   - Sign in and find your v2 project

2. **Navigate to Environment Variables**
   - Click on your project
   - Go to "Settings" → "Environment Variables"

3. **Copy the Values**
   - Look for:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Copy each value

## What Each Key Is Used For

- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project's API endpoint
  - Safe to expose in client-side code (starts with `NEXT_PUBLIC_`)
  
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Public API key for client-side operations
  - Safe to expose in client-side code
  - Has row-level security policies applied
  
- **SUPABASE_SERVICE_ROLE_KEY**: Secret key for server-side operations
  - ⚠️ **NEVER expose this in client-side code**
  - Bypasses row-level security
  - Only use in API routes/server-side code

## Adding to Vercel

When adding these to Vercel:

1. Go to your v3 project in Vercel
2. Settings → Environment Variables
3. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: (paste your project URL)
   - Environment: Production, Preview, Development (select all)
   
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: (paste your anon key)
   - Environment: Production, Preview, Development (select all)
   
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (paste your service role key)
   - Environment: Production, Preview, Development (select all)
   - ⚠️ Make sure this is marked as "Sensitive" (Vercel does this automatically)

## Need to Create a New Supabase Project?

If you don't have a Supabase project yet:

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `KrashBoard` (or your choice)
   - Database password: (create a strong password)
   - Region: (choose closest to you)
4. Click "Create new project"
5. Wait 2-3 minutes for setup
6. Follow Method 1 above to get your credentials

