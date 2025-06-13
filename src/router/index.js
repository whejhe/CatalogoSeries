// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfilesStore } from '@/stores/profiles'

import HomePage from '@/views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import ManageSeries from '@/views/ManageSeries.vue' // Este componente gestionará añadir y editar
import AdminPage from '@/views/AdminPage.vue'
import SeriesDetailPage from '@/views/SeriesDetailPage.vue'
import ProfileSettings from '@/views/ProfileSettings.vue' // <-- NUEVA IMPORTACIÓN

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
      // RUTA MODIFICADA: Ahora acepta un ID opcional para edición
      path: '/manage-series/:id?', // El '?' hace que el parámetro 'id' sea opcional
      name: 'manage-series', // Nombre único para la ruta de gestión (añadir o editar)
      component: ManageSeries,
      props: true, // Permite que el 'id' del parámetro de la ruta se pase como prop al componente
      meta: { requiresAuth: true, requiresAdminOrSuperAdmin: true }, // Protegida
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPage,
      meta: { requiresAuth: true, requiresAdminOrSuperAdmin: true }, // Protegida
    },
    {
      path: '/series/:id',
      name: 'series-detail',
      component: SeriesDetailPage,
      props: true, // Pasa el 'id' como prop
    },
    {
      path: '/profile-settings', // <-- NUEVA RUTA DEFINIDA
      name: 'profile-settings',
      component: ProfileSettings,
      meta: { requiresAuth: true }, // Esta ruta requiere que el usuario esté autenticado
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const profilesStore = useProfilesStore()

  // Asegurar que el perfil del usuario esté cargado antes de la navegación
  // Esto es crucial para las guardias de ruta basadas en roles
  if (authStore.isAuthenticated && !profilesStore.myProfile && !profilesStore.loading) {
    await profilesStore.fetchMyProfile()
  }

  const isAuthenticated = authStore.isAuthenticated
  const userRole = profilesStore.myProfile?.role?.name

  // Redirigir si intenta acceder a login/register estando autenticado
  if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    next({ name: 'home' })
  } else if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirigir a login si la ruta requiere autenticación y el usuario no está autenticado
    next({ name: 'login' })
  } else if (to.meta.requiresAdminOrSuperAdmin) {
    // Redirigir si la ruta requiere admin/super_admin y el usuario no tiene el rol
    if (!isAuthenticated || !(userRole === 'admin' || userRole === 'super_admin')) {
      // Puedes redirigir a una página de "Acceso Denegado" o a la página de inicio
      next({ name: 'home' })
    } else {
      next() // Permitir acceso
    }
  } else {
    next() // Para todas las demás rutas
  }
})

export default router
