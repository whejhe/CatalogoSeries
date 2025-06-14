-- Cambio de rol
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'super_admin')
WHERE user_id = 'd12191e4-b22b-4632-8817-a1bc62be3b9c';

-- Consulta de datos del usuario
SELECT
    p.id AS profile_id,
    p.user_id,
    p.nombre,
    p.apellidos,
    p.nick,
    p.edad,
    p.email,
    p.avatar_url,
    r.name AS role_name,
    p.created_at,
    p.updated_at
FROM
    public.profiles p
JOIN
    public.roles r ON p.role_id = r.id
WHERE
    p.nick = 'c6rlosfern6ndez@gmail.com';


[
  {
    "id": "626c7975-c6b2-4d00-8867-532b9f537491",
    "user_id": "740dcff3-bf0b-402a-8b48-87a6ac5ba1e1",
    "role_id": 3,
    "nombre": null, -- No se esta almacenando el nombre correctamente
    "apellidos": null, -- No se esta almacenando los apellidos correctamente
    "nick": "c6rlosfern6ndez@gmail.com", -- Esto esta mas aqui deberia a haber guardado whejhe
    "edad": null,
    "email": "c6rlosfern6ndez@gmail.com",
    "avatar_url": null, -- No se esta almacenando la URL del avatar correctamente
    "created_at": "2025-06-13 14:57:33.621911+00",
    "updated_at": "2025-06-13 15:01:59.785774+00"
  }
]

