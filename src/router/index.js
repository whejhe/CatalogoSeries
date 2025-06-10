// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import AdminPage from '../views/AdminPage.vue'
import ManageSeries from '../views/ManageSeries.vue'

import { useAuthStore } from '../stores/auth'
import { useProfilesStore } from '../stores/profiles'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
    },
    {
      path: '/manage-series',
      name: 'manage-series',
      component: ManageSeries,
      meta: { requiresAuth: true, requiresAdminOrSuperAdmin: true }, // Protegida para admin/super_admin
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPage,
      meta: { requiresAuth: true, requiresAdmin: true }, // Protegida para admin (y super_admin por extensión)
    },
    // NOTA: No existe una vista para AdminPage.vue todavía.
    // Si esta vista es solo un placeholder, puedes dejarla así.
    // Más adelante deberías crear AdminPage.vue si quieres que tenga contenido real.
  ],
})

// Guarda de navegación global (Global Navigation Guard)
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const profilesStore = useProfilesStore()

  // Asegúrate de que el estado de autenticación esté inicializado.
  if (authStore.loading && !authStore.isAuthenticated) {
    // Solo si aún no está autenticado y cargando
    await authStore.initAuth()
  }

  // Cargar el perfil del usuario autenticado si no está cargado y el usuario existe
  // Esto es vital para que el userRole esté disponible.
  if (authStore.isAuthenticated && !profilesStore.myProfile && !profilesStore.loading) {
    await profilesStore.fetchMyProfile()
  }

  const isAuthenticated = authStore.isAuthenticated
  const userRole = profilesStore.myProfile?.role?.name // Accede al rol del perfil cargado

  // --- Lógica de Protección Refactorizada ---

  // 1. Redirigir si el usuario ya está autenticado e intenta ir a login/register
  if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    next('/')
    return // Importante para detener la ejecución y no evaluar más condiciones
  }

  // 2. Comprobar si la ruta requiere autenticación
  if (to.meta.requiresAuth && !isAuthenticated) {
    alert('Necesitas iniciar sesión para acceder a esta página.') // Mensaje más genérico
    next('/login')
    return
  }

  // Si requiere autenticación Y está autenticado, ahora comprobamos los roles
  if (isAuthenticated) {
    // 3. Comprobar si la ruta requiere 'super_admin' o 'admin' (como /manage-series)
    if (to.meta.requiresAdminOrSuperAdmin) {
      if (userRole === 'admin' || userRole === 'super_admin') {
        next() // Permitir acceso
        return
      } else {
        alert(
          'Acceso denegado. No tienes los permisos necesarios para esta sección (Admin/Super Admin).',
        )
        next('/')
        return
      }
    }

    // 4. Comprobar si la ruta requiere solo 'admin' (como /admin)
    // NOTA: Un 'super_admin' es también un 'admin' a efectos de permisos en este contexto.
    if (to.meta.requiresAdmin) {
      if (userRole === 'admin' || userRole === 'super_admin') {
        // Super Admin también es admin
        next() // Permitir acceso
        return
      } else {
        alert('Acceso denegado. No tienes permisos de administrador.')
        next('/')
        return
      }
    }
  }

  // Si ninguna de las condiciones anteriores redirige, permite la navegación.
  next()
})

export default router
