9c3c1084-bf0f-46cc-bf3c-ec3e0d095efa

UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'super_admin')
WHERE user_id = 'el id del usuario';
