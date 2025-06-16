-- db/schema.sql
-- SQL para ELIMINAR las tablas existentes en tu base de datos Supabase
-- El orden de eliminación es crucial para evitar errores de dependencias (claves foráneas)
-- Se eliminan las tablas que dependen de otras primero.

DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.series_ratings CASCADE;
DROP TABLE IF EXISTS public.user_series_progress CASCADE;
DROP TABLE IF EXISTS public.serie_genres CASCADE;
DROP TABLE IF EXISTS public.genres CASCADE;
DROP TABLE IF EXISTS public.list_series CASCADE;
DROP TABLE IF EXISTS public.user_lists CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.series CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- Habilitar la extensión uuid-ossp para generar UUIDs.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--
-- Estructura de la tabla `roles`
-- Almacena los diferentes roles de usuario (ej. user, admin).
--
CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Reinicia la secuencia SERIAL para `roles`
-- Esto asegura que los IDs empiecen desde 1 de nuevo si la tabla se recrea de cero.
SELECT setval('public.roles_id_seq', 1, false);

-- Inserción inicial de roles (¡solo si la tabla está vacía!)
INSERT INTO public.roles (name) VALUES
    ('user'),
    ('admin'),
    ('super_admin'),
    ('guest')
ON CONFLICT (name) DO NOTHING;


--
-- Estructura de la tabla `series`
-- Contiene la información principal de cada serie en el catálogo.
CREATE TABLE IF NOT EXISTS public.series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    original_title TEXT,
    sinopsis TEXT NOT NULL,
    portada_url TEXT NOT NULL,
    año_lanzamiento INTEGER NOT NULL,
    banda_sonora_url TEXT,
    trailer_url TEXT,
    average_rating NUMERIC(3, 2) DEFAULT 0.00,
    ratings_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

--
-- Estructura de la tabla `genres`
-- Normaliza y almacena los diferentes géneros disponibles.
--
CREATE TABLE IF NOT EXISTS public.genres (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Reinicia la secuencia SERIAL para `genres`
SELECT setval('public.genres_id_seq', 1, false);

-- Inserción inicial de géneros comunes.
INSERT INTO public.genres (name) VALUES
    ('Acción'),
    ('Aventura'),
    ('Ciencia Ficción'),
    ('Comedia'),
    ('Drama'),
    ('Fantasía'),
    ('Terror'),
    ('Misterio'),
    ('Romance'),
    ('Terror'),
    ('Animación'),
    ('Documental'),
    ('Histórico'),
    ('Musical'),
    ('Crimen'),
    ('Guerra'),
    ('Familia'),
    ('Deportes'),
    ('Western'),
    ('Biográfico'),
    ('Infantil'),
    ('Suspenso'),
    ('Independiente'),
    ('Superhéroes'),
    ('Cine Negro'),
    ('Ciberpunk'),
    ('Distopía'),
    ('Steampunk'),
    ('Zombies')
ON CONFLICT (name) DO NOTHING;

--
-- Estructura de la tabla de unión `serie_genres`
-- Permite que una serie esté asociada a múltiples géneros (relación N:M).
--
CREATE TABLE IF NOT EXISTS public.serie_genres (
    serie_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES public.genres(id) ON DELETE CASCADE,
    PRIMARY KEY (serie_id, genre_id) -- Asegura que una serie y un género solo se relacionen una vez
);

-- Estructura de la tabla `profiles` (Actualizada con `email`)
--
-- Estructura de la tabla `profiles`
-- Almacena información detallada del perfil de cada usuario, enlazada con auth.users.
--
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Clave foránea a auth.users
    role_id INTEGER NOT NULL REFERENCES public.roles(id) DEFAULT 1, -- Clave foránea a roles.id, por defecto 'user'
    nombre TEXT,
    apellidos TEXT,
    nick TEXT NOT NULL UNIQUE,
    edad INTEGER,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT default 'https://hzremmurawbartxmpimt.supabase.co/storage/v1/object/public/user-avatars/avatars/default-avatar.png" ',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

--
-- Estructura de la tabla `user_lists`
-- Permite a los usuarios crear sus propias listas personalizadas de series.
-- Añadimos un campo `is_default` para identificar listas generadas automáticamente.
--
CREATE TABLE IF NOT EXISTS public.user_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE, -- Nuevo campo: true si es una lista por defecto (ej. Favoritos)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (profile_id, name) -- Un usuario no puede tener dos listas con el mismo nombre
);

--
-- Estructura de la tabla `list_series`
-- Tabla de unión que relaciona series con las listas de usuario (N:M).
--
CREATE TABLE IF NOT EXISTS public.list_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES public.user_lists(id) ON DELETE CASCADE,
    serie_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (list_id, serie_id) -- Asegura que no se dupliquen series en una lista
);

--
-- Estructura de la tabla `series_ratings`
-- Permite a los usuarios valorar y escribir reseñas sobre las series.
--
CREATE TABLE IF NOT EXISTS public.series_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    serie_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- Valoración de 1 a 5 estrellas
    review_text TEXT, -- Campo opcional para una reseña detallada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (profile_id, serie_id) -- Un usuario solo puede valorar una serie una vez
);

--
-- Estructura de la tabla `user_series_progress`
-- Permite a los usuarios llevar un seguimiento del progreso de las series.
--
CREATE TABLE IF NOT EXISTS public.user_series_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    serie_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pendiente', -- Ej: 'viendo', 'pendiente', 'terminada', 'dropeada'
    current_season INTEGER DEFAULT 0, -- 0 o 1 si aún no ha empezado la primera temporada
    current_episode INTEGER DEFAULT 0, -- 0 o 1 si aún no ha empezado el primer episodio
    last_watched_at TIMESTAMP WITH TIME ZONE, -- Cuándo fue la última vez que el usuario vio algo de esta serie
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() -- Considera si este campo es realmente necesario si ya tienes 'last_watched_at'
);


--
-- Estructura de la tabla `comments`
-- Permite a los usuarios dejar comentarios en las series.
--
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    serie_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE, 
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
