SELECT
    au.id AS auth_id, -- ID del usuario de autenticación
    au.email,         -- Email del usuario de autenticación
    au.created_at AS auth_created_at, -- Fecha de creación en auth.users
    pp.id AS profile_id, -- ID del perfil en public.profiles
    pp.nick,          -- Nick del perfil
    pp.nombre,        -- Nombre del perfil
    pp.apellidos,     -- Apellidos del perfil
    pp.edad,          -- Edad del perfil
    pp.avatar_url,    -- URL del avatar del perfil
    pp.created_at AS profile_created_at, -- Fecha de creación del perfil
    r.name AS role_name -- Nombre del rol
FROM
    auth.users AS au -- Alias para la tabla auth.users
JOIN
    public.profiles AS pp ON au.id = pp.user_id -- Unimos con public.profiles usando el user_id
JOIN
    public.roles AS r ON pp.role_id = r.id; -- Unimos con public.roles para obtener el nombre del rol