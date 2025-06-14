-- SQL para ELIMINAR todos los datos de las tablas en la base de datos Supabase
-- El orden de eliminación es crucial para evitar errores de dependencias (claves foráneas)
-- Se eliminan los datos de las tablas que dependen de otras primero.

DELETE FROM public.comments;
DELETE FROM public.series_ratings;
DELETE FROM public.user_series_progress;
DELETE FROM public.serie_genres;
DELETE FROM public.list_series;
DELETE FROM public.user_lists;
DELETE FROM public.profiles;
DELETE FROM public.series;
DELETE FROM public.genres;
DELETE FROM public.roles;

-- Reiniciar las secuencias SERIAL para las tablas roles y genres
ALTER SEQUENCE public.roles_id_seq RESTART WITH 1;
ALTER SEQUENCE public.genres_id_seq RESTART WITH 1;

-- Insertar los roles por defecto
INSERT INTO public.roles (name) VALUES
    ('user'),
    ('admin'),
    ('super_admin'),
    ('guest')
ON CONFLICT (name) DO NOTHING;

-- Insertar los generos por defecto
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
