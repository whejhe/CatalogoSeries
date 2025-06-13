-- db/schema.sql
-- SQL para ELIMINAR las tablas existentes en tu base de datos Supabase
-- El orden de eliminación es crucial para evitar errores de dependencias (claves foráneas)
-- Se eliminan las tablas que dependen de otras primero.

-- Elimina las tablas de comentarios
DROP TABLE IF EXISTS public.comments CASCADE;

-- Elimina las tablas de valoración y reseña
DROP TABLE IF EXISTS public.series_ratings CASCADE;

-- Elimina las tablas de seguimiento de progreso
DROP TABLE IF EXISTS public.user_series_progress CASCADE;

-- Elimina las tablas de unión de géneros
DROP TABLE IF EXISTS public.serie_genres CASCADE;

-- Elimina la tabla de géneros
DROP TABLE IF EXISTS public.genres CASCADE;

-- Elimina la tabla de unión entre listas y series
DROP TABLE IF EXISTS public.list_series CASCADE;

-- Elimina la tabla de listas de usuario
DROP TABLE IF EXISTS public.user_lists CASCADE;

-- Elimina la tabla de perfiles de usuario
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Elimina la tabla de series
DROP TABLE IF EXISTS public.series CASCADE;

-- Elimina la tabla de roles
DROP TABLE IF EXISTS public.roles CASCADE;

-- Elimina los triggers y funciones que puedan haber sido creados
-- Es crucial eliminar el trigger antes de eliminar la función si la función es utilizada por el trigger.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Elimina la función de actualización de 'updated_at'
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Elimina la función de actualización de valoración media
DROP FUNCTION IF EXISTS public.update_series_average_rating();


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
-- 'ON CONFLICT DO NOTHING' evita errores si los roles ya existen al recrear.
INSERT INTO public.roles (name) VALUES
    ('user'),
    ('admin'),
    ('super_admin'),
    ('guest')
ON CONFLICT (name) DO NOTHING;


--
-- Estructura de la tabla `series`
-- Contiene la información principal de cada serie en el catálogo.
-- Incluye 'original_title', 'average_rating' y 'ratings_count'.
--
-- NOTA: Se ha eliminado el campo 'genero' de esta tabla, ya que los géneros
--       se gestionan de forma normalizada a través de 'genres' y 'serie_genres'.
--
CREATE TABLE IF NOT EXISTS public.series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    original_title TEXT, -- Nuevo campo: título original de la serie (opcional)
    sinopsis TEXT NOT NULL,
    portada_url TEXT NOT NULL,
    año_lanzamiento INTEGER NOT NULL,
    banda_sonora_url TEXT,
    trailer_url TEXT,
    average_rating NUMERIC(3, 2) DEFAULT 0.00, -- Valoración media calculada
    ratings_count INTEGER DEFAULT 0,          -- Número total de valoraciones
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
CREATE INDEX IF NOT EXISTS idx_series_original_title ON public.series (original_title);


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

-- Índices para búsquedas rápidas en la tabla de unión
CREATE INDEX IF NOT EXISTS idx_serie_genres_serie_id ON public.serie_genres (serie_id);
CREATE INDEX IF NOT EXISTS idx_serie_genres_genre_id ON public.serie_genres (genre_id);


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
    nick TEXT UNIQUE NOT NULL, -- Considerar si 'UNIQUE' es deseable si el nick se autogenera con email.
                               -- Podría causar conflictos si un email ya existe como nick.
    edad INTEGER,
    email TEXT, -- ¡CAMPO EMAIL AÑADIDO AQUÍ!
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
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email); -- Nuevo índice para el email


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
-- Tabla de unión que relaciona series con las listas de usuario (N:M).
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
CREATE INDEX IF NOT EXISTS idx_list_series_serie_id ON public.list_series (serie_id);


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

-- Trigger para actualizar automáticamente 'updated_at' en la tabla 'series_ratings'
DROP TRIGGER IF EXISTS update_series_ratings_updated_at ON public.series_ratings;
CREATE TRIGGER update_series_ratings_updated_at
BEFORE UPDATE ON public.series_ratings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_series_ratings_profile_id ON public.series_ratings (profile_id);
CREATE INDEX IF NOT EXISTS idx_series_ratings_serie_id ON public.series_ratings (serie_id);


--
-- FUNCIONES Y TRIGGERS PARA CALCULAR LA VALORACIÓN MEDIA EN `series`
--

-- Función para actualizar la valoración media y el conteo de una serie
CREATE OR REPLACE FUNCTION public.update_series_average_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_serie_id UUID;
    v_avg_rating NUMERIC(3, 2);
    v_ratings_count INTEGER;
BEGIN
    -- Determinar el ID de la serie afectada
    IF TG_OP = 'DELETE' THEN
        v_serie_id := OLD.serie_id; -- Cuando se borra, usamos el ID de la fila vieja
    ELSE
        v_serie_id := NEW.serie_id; -- Cuando se inserta o actualiza, usamos el ID de la fila nueva
    END IF;

    -- Calcular el promedio y el conteo de valoraciones para esa serie
    SELECT
        COALESCE(AVG(rating), 0.00)::NUMERIC(3, 2), -- Calcula el promedio, si no hay valoraciones, 0.00
        COUNT(rating)                              -- Cuenta el número de valoraciones
    INTO
        v_avg_rating,
        v_ratings_count
    FROM
        public.series_ratings
    WHERE
        serie_id = v_serie_id;

    -- Actualizar la tabla `series` con los nuevos valores
    UPDATE public.series
    SET
        average_rating = v_avg_rating,
        ratings_count = v_ratings_count
    WHERE
        id = v_serie_id;

    RETURN NULL; -- Los triggers AFTER ROW deben devolver NULL
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER es importante para que el trigger pueda ejecutar UPDATE en `series`

-- Trigger para insertar nuevas valoraciones
DROP TRIGGER IF EXISTS trg_series_ratings_insert ON public.series_ratings;
CREATE TRIGGER trg_series_ratings_insert
AFTER INSERT ON public.series_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_series_average_rating();

-- Trigger para actualizar valoraciones existentes
DROP TRIGGER IF EXISTS trg_series_ratings_update ON public.series_ratings;
CREATE TRIGGER trg_series_ratings_update
AFTER UPDATE OF rating ON public.series_ratings -- Solo se activa si la columna 'rating' cambia
FOR EACH ROW
EXECUTE FUNCTION public.update_series_average_rating();

-- Trigger para eliminar valoraciones
DROP TRIGGER IF EXISTS trg_series_ratings_delete ON public.series_ratings;
CREATE TRIGGER trg_series_ratings_delete
AFTER DELETE ON public.series_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_series_average_rating();


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

-- Trigger para actualizar automáticamente 'updated_at' en la tabla 'user_series_progress'
DROP TRIGGER IF EXISTS update_user_series_progress_updated_at ON public.user_series_progress;
CREATE TRIGGER update_user_series_progress_updated_at
BEFORE UPDATE ON public.user_series_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_series_progress_profile_id ON public.user_series_progress (profile_id);
CREATE INDEX IF NOT EXISTS idx_user_series_progress_serie_id ON public.user_series_progress (serie_id);


--
-- Estructura de la tabla `comments`
-- Permite a los usuarios dejar comentarios en las series.
--
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    serie_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE, -- Comentario asociado a una serie
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- Para comentarios anidados (opcional)
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para actualizar automáticamente 'updated_at' en la tabla 'comments'
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_comments_profile_id ON public.comments (profile_id);
CREATE INDEX IF NOT EXISTS idx_comments_serie_id ON public.comments (serie_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON public.comments (parent_comment_id);


--
-- Trigger para crear un perfil automáticamente al registrar un nuevo usuario en Supabase Auth
-- También crea la lista 'Favoritos' por defecto para el nuevo usuario.
--
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id INTEGER;
    new_profile_id UUID;
BEGIN
    -- Obtener el ID del rol 'user' (asumiendo que 'user' es el rol por defecto)
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'user';

    -- Insertar un nuevo perfil para el usuario recién autenticado
    -- Se usa NEW.email como nick inicial. Es importante que el nick sea único.
    INSERT INTO public.profiles (user_id, nick, role_id, email, created_at)
    VALUES (NEW.id, NEW.email, default_role_id, NEW.email, now())
    RETURNING id INTO new_profile_id; -- Capturamos el ID del nuevo perfil

    -- Crear la lista "Favoritos" por defecto para este nuevo usuario
    INSERT INTO public.user_lists (profile_id, name, description, is_default, created_at)
    VALUES (new_profile_id, 'Favoritos', 'Mis series favoritas.', TRUE, now());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Asegurarse de que el usuario 'supabase_admin' pueda definir las funciones con SECURITY DEFINER
-- Esto es una buena práctica para la seguridad de las funciones que interactúan con datos.
ALTER FUNCTION public.handle_new_user() SET SEARCH_PATH = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET SEARCH_PATH = public, pg_temp;
ALTER FUNCTION public.update_series_average_rating() SET SEARCH_PATH = public, pg_temp;