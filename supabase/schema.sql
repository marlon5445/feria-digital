-- ==============================================================================
-- FERIA DIGITAL - ESQUEMA GLOBAL CONSOLIDADO E IDEMPOTENTE (schema.sql)
-- ==============================================================================
-- Este archivo es la fuente única de la verdad para la base de datos de Supabase.
-- Puede ser ejecutado múltiples veces sin errores gracias a las cláusulas
-- IF NOT EXISTS, DROP POLICY IF EXISTS y bloques DO $$.
-- ==============================================================================

-- 1. EXTENSIONES Y PERMISOS BASE
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- ==============================================================================
-- 2. TABLAS PRINCIPALES
-- ==============================================================================

-- A. TABLA: profiles (Perfiles y roles de usuarios vinculados a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'super_admin', 'user')),
    full_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- B. TABLA: stores (Negocios / Tiendas de Emprendedores)
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    logo_url TEXT,
    whatsapp_number TEXT NOT NULL,
    yape_number TEXT NOT NULL,
    theme_color TEXT NOT NULL DEFAULT '#dc2626',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores(user_id);

-- C. TABLA: products (Productos de cada Catálogo)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- ==============================================================================
-- 3. TRIGGERS Y FUNCIONES DE SINCRONIZACIÓN AUTOMÁTICA
-- ==============================================================================

-- Función para manejar la creación automática del perfil al registrar un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    assigned_role TEXT;
BEGIN
    -- Asignar rol 'admin' si el email es admin@feriadigital.pe o si viene en los metadatos
    IF NEW.email = 'admin@feriadigital.pe'
       OR (NEW.raw_user_meta_data->>'role') = 'admin'
       OR (NEW.raw_app_meta_data->>'role') = 'admin' THEN
        assigned_role := 'admin';
    ELSE
        assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
    END IF;

    INSERT INTO public.profiles (id, email, role, full_name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        assigned_role,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        updated_at = now();

    RETURN NEW;
END;
$$;

-- Trigger sobre auth.users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- ==============================================================================
-- 4. HABILITACIÓN DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. POLÍTICAS RLS IDEMPOTENTES
-- ==============================================================================

-- A. Políticas para PROFILES
DROP POLICY IF EXISTS "Lectura de perfiles para usuarios autenticados" ON public.profiles;
CREATE POLICY "Lectura de perfiles para usuarios autenticados"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    auth.uid() = id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

DROP POLICY IF EXISTS "Actualización de perfiles por dueño o admin" ON public.profiles;
CREATE POLICY "Actualización de perfiles por dueño o admin"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
    auth.uid() = id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
    auth.uid() = id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- B. Políticas para STORES
DROP POLICY IF EXISTS "Lectura pública de tiendas" ON public.stores;
CREATE POLICY "Lectura pública de tiendas"
ON public.stores
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Creación de tiendas restringida a administradores" ON public.stores;
DROP POLICY IF EXISTS "Creación de tienda para usuarios autenticados" ON public.stores;
CREATE POLICY "Creación de tiendas restringida a administradores"
ON public.stores
FOR INSERT
TO authenticated
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.uid() = user_id
);

DROP POLICY IF EXISTS "Actualización de tienda por su dueño o admin" ON public.stores;
DROP POLICY IF EXISTS "Actualización de tienda por su dueño" ON public.stores;
CREATE POLICY "Actualización de tienda por su dueño o admin"
ON public.stores
FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
    auth.uid() = user_id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

DROP POLICY IF EXISTS "Eliminación de tienda por su dueño o admin" ON public.stores;
DROP POLICY IF EXISTS "Eliminación de tienda por su dueño" ON public.stores;
CREATE POLICY "Eliminación de tienda por su dueño o admin"
ON public.stores
FOR DELETE
TO authenticated
USING (
    auth.uid() = user_id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- C. Políticas para PRODUCTS
DROP POLICY IF EXISTS "Lectura pública de productos" ON public.products;
CREATE POLICY "Lectura pública de productos"
ON public.products
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Creación de productos por dueño de tienda" ON public.products;
CREATE POLICY "Creación de productos por dueño de tienda"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = products.store_id
          AND (
              stores.user_id = auth.uid()
              OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
              OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
          )
    )
);

DROP POLICY IF EXISTS "Actualización de productos por dueño de tienda" ON public.products;
CREATE POLICY "Actualización de productos por dueño de tienda"
ON public.products
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = products.store_id
          AND (
              stores.user_id = auth.uid()
              OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
              OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
          )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = products.store_id
          AND (
              stores.user_id = auth.uid()
              OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
              OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
          )
    )
);

DROP POLICY IF EXISTS "Eliminación de productos por dueño de tienda" ON public.products;
CREATE POLICY "Eliminación de productos por dueño de tienda"
ON public.products
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = products.store_id
          AND (
              stores.user_id = auth.uid()
              OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
              OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
          )
    )
);

-- ==============================================================================
-- 6. ASIGNACIÓN / INICIALIZACIÓN DE ROL SUPER ADMIN
-- ==============================================================================
DO $$
DECLARE
    v_user_id UUID;
    v_admin_email TEXT := 'admin@feriadigital.pe';
BEGIN
    -- Buscar el usuario por email en auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_admin_email LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        -- Actualizar metadatos en auth.users para asignarle rol 'admin'
        UPDATE auth.users
        SET 
            raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb,
            raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
        WHERE id = v_user_id;

        -- Asegurar registro correspondiente en public.profiles
        INSERT INTO public.profiles (id, email, role, full_name, updated_at)
        VALUES (v_user_id, v_admin_email, 'admin', 'Super Administrador', now())
        ON CONFLICT (id) DO UPDATE
        SET 
            role = 'admin',
            email = v_admin_email,
            updated_at = now();

        RAISE NOTICE 'Rol de administrador asignado exitosamente a: % (ID: %)', v_admin_email, v_user_id;
    ELSE
        RAISE NOTICE 'El usuario % aún no existe en auth.users. Se inicializará con rol admin al iniciar sesión o invocar /api/admin/seed.', v_admin_email;
    END IF;
END $$;
