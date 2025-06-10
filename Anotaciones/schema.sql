-- db/schema.sql
-- SQL para ELIMINAR las tablas existentes en tu base de datos Supabase

-- Elimina la tabla de unión entre listas y series
DROP TABLE IF EXISTS public.list_series CASCADE;

-- Elimina la tabla de listas de usuario
DROP TABLE IF EXISTS public.user_lists CASCADE;

-- Elimina la tabla de favoritos de usuario
DROP TABLE IF EXISTS public.user_favorites CASCADE;

-- Elimina la tabla de perfiles de usuario
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Elimina la tabla de series
DROP TABLE IF EXISTS public.series CASCADE;

-- Elimina la tabla de roles (si ya la habías creado por error o si la quieres recrear)
DROP TABLE IF EXISTS public.roles CASCADE;

-- Elimina los triggers y funciones que puedan haber sido creados
-- Es crucial eliminar el trigger antes de eliminar la función si la función es utilizada por el trigger.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- La función update_updated_at_column es genérica, pero la eliminamos para estar seguros
DROP FUNCTION IF EXISTS public.update_updated_at_column();



-- db/schema.sql

-- Habilitar la extensión uuid-ossp para generar UUIDs.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Función para actualizar automáticamente 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--
-- Estructura de la tabla `roles`
--
CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Inserción inicial de roles (¡solo si la tabla está vacía!)
INSERT INTO public.roles (name) VALUES
    ('user'),
    ('admin'),
    ('super_admin'),
    ('guest')
ON CONFLICT (name) DO NOTHING; -- Evita errores si intentas insertar roles que ya existen


--
-- Estructura de la tabla `series`
--
CREATE TABLE IF NOT EXISTS public.series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    sinopsis TEXT NOT NULL,
    portada_url TEXT NOT NULL,
    genero TEXT NOT NULL,
    año_lanzamiento INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para actualizar automáticamente 'updated_at' en la tabla 'series'
DROP TRIGGER IF EXISTS update_series_updated_at ON public.series;
CREATE TRIGGER update_series_updated_at
BEFORE UPDATE ON public.series
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices para búsquedas más rápidas en 'series'
CREATE INDEX IF NOT EXISTS idx_series_titulo ON public.series (titulo);
CREATE INDEX IF NOT EXISTS idx_series_genero ON public.series (genero);


--
-- Estructura de la tabla `profiles`
--
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Clave foránea a auth.users
    role_id INTEGER NOT NULL REFERENCES public.roles(id) DEFAULT 1, -- Clave foránea a roles.id, por defecto 'user' (asumiendo ID 1)
    nombre TEXT,
    apellidos TEXT,
    nick TEXT UNIQUE NOT NULL,
    edad INTEGER,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para actualizar automáticamente 'updated_at' en la tabla 'profiles'
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices para búsquedas más rápidas en 'profiles'
CREATE INDEX IF NOT EXISTS idx_profiles_nick ON public.profiles (nick);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);


--
-- Estructura de la tabla `user_favorites`
--
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    serie_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (profile_id, serie_id) -- Asegura que no se dupliquen favoritos
);

-- Índices para búsquedas rápidas en 'user_favorites'
CREATE INDEX IF NOT EXISTS idx_user_favorites_profile_id ON public.user_favorites (profile_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_serie_id ON public.user_favorites (serie_id);


--
-- Estructura de la tabla `user_lists`
--
CREATE TABLE IF NOT EXISTS public.user_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (profile_id, name) -- Un usuario no puede tener dos listas con el mismo nombre
);

-- Trigger para actualizar automáticamente 'updated_at' en la tabla 'user_lists'
DROP TRIGGER IF EXISTS update_user_lists_updated_at ON public.user_lists;
CREATE TRIGGER update_user_lists_updated_at
BEFORE UPDATE ON public.user_lists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices para búsquedas rápidas en 'user_lists'
CREATE INDEX IF NOT EXISTS idx_user_lists_profile_id ON public.user_lists (profile_id);


--
-- Estructura de la tabla `list_series`
--
CREATE TABLE IF NOT EXISTS public.list_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES public.user_lists(id) ON DELETE CASCADE,
    serie_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (list_id, serie_id) -- Asegura que no se dupliquen series en una lista
);

-- Índices para búsquedas rápidas en 'list_series'
CREATE INDEX IF NOT EXISTS idx_list_series_list_id ON public.list_series (list_id);
-- LÍNEA CORREGIDA ABAJO
CREATE INDEX IF NOT EXISTS idx_list_series_serie_id ON public.list_series (serie_id);


--
-- Trigger para crear un perfil automáticamente al registrar un nuevo usuario en Supabase Auth
--
-- NOTA IMPORTANTE: Si ya creaste este trigger manualmente en el editor SQL,
-- puedes omitir esta parte del script para evitar duplicados o errores.
-- Si vas a usar este script para crear todo desde cero, déjalo.
-- Recuerda que 'nick' se inicializa con el email del usuario.
-- Si el email no es un buen nick, necesitarás lógica adicional en tu aplicación
-- para que el usuario pueda establecer su nick después del registro.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id INTEGER;
BEGIN
    -- Obtener el ID del rol 'user'
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'user';

    -- Insertar un nuevo perfil para el usuario recién autenticado
    INSERT INTO public.profiles (user_id, nick, role_id, created_at)
    VALUES (NEW.id, NEW.email, default_role_id, now()); -- NEW.email se usa como nick inicial, asumiendo unicidad

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Asegurarse de que el usuario 'supabase_admin' pueda definir las funciones con SECURITY DEFINER
ALTER FUNCTION public.handle_new_user() SET SEARCH_PATH = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET SEARCH_PATH = public, pg_temp;