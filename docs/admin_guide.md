# DhanMITR Private Admin Panel & RBAC Guide

This document provides complete instructions for setting up, managing, and accessing the **Private Admin Panel** within DhanMITR.

---

## 1. Supabase SQL Migration Script

Run the following SQL in your **Supabase Project Dashboard -> SQL Editor** to establish the Admin RBAC tables, security policies, and promote your account to `superadmin`:

```sql
-- ==============================================================================
-- DhanMITR Admin RBAC Schema Migration
-- ==============================================================================

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'moderator')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 2. Security Definer Helper Function: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = check_user_id 
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. RLS Policies for admin_users
CREATE POLICY "Admins can view admin users list"
ON public.admin_users FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Superadmins can manage admin users"
ON public.admin_users FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
          AND role = 'superadmin' 
          AND is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
          AND role = 'superadmin' 
          AND is_active = true
    )
);

-- 4. Admin Audit Logs Table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_email TEXT,
    action TEXT NOT NULL,
    target_resource TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_logs FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- ==============================================================================
-- 5. Promote First Superadmin Account (ks9875277@gmail.com)
-- ==============================================================================
DO $$
DECLARE
    target_email TEXT := 'ks9875277@gmail.com';
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email LIMIT 1;
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.admin_users (user_id, role, is_active)
        VALUES (target_user_id, 'superadmin', true)
        ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin', is_active = true;
        RAISE NOTICE 'User % (ID: %) successfully promoted to superadmin.', target_email, target_user_id;
    ELSE
        RAISE NOTICE 'User % does not exist in auth.users yet. Create an account via email or Google sign-in first, then re-run this promotion block.', target_email;
    END IF;
END $$;
```

---

## 2. Environment Variables Configuration

In `ui/.env.local` (or your deployment environment), configure:

```env
# Frontend Client Keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Server-Side Only Service Role Key (Used exclusively by Next.js route handlers)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
```

> **Security Note:** The `SUPABASE_SERVICE_ROLE_KEY` is kept exclusively on the server side and never sent to or bundled into browser code.

---

## 3. How to Access the Private Admin Panel

1. **Sign Up / Log In**: Ensure you have created your account with `ks9875277@gmail.com`.
2. **Access Route**: Navigate directly to:
   ```
   http://localhost:3000/admin
   ```
   or for direct login:
   ```
   http://localhost:3000/admin/login
   ```
3. **Public Isolation**: The public website (`/`) has zero links, buttons, or headers leading to `/admin`.
4. **Access Control**: Any unauthenticated guest or authenticated non-admin user visiting `/admin` or calling `/api/admin/*` will receive an isolated **403 Forbidden Access Denied** response.

---

## 4. Admin Panel Features

* **Overview Dashboard**: Real-time KPI summaries (registered users, onboarded count, active OTT trackers, active insurance policies, aggregate monthly volumes) and registration velocity.
* **User & Role Management**: Searchable directory by name, email, or user UUID. Inspect financial profile telemetry and promote/demote administrative roles (`superadmin`, `admin`, `moderator`, `user`).
* **Financial Demographics**: Anonymized macro-level wealth distributions (tax regimes, risk tolerances, employment categories, average liquidity reserves).
* **Audit Trail**: Real-time immutable record of administrative operations with full JSON event payloads.
* **System Diagnostics**: Telemetry checking Supabase infrastructure, server time, and environment configurations.
