
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'super_admin')
WHERE user_id = 'd12191e4-b22b-4632-8817-a1bc62be3b9c';
