<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="brand-link">Catálogo de Series</router-link>
    </div>
    <div class="navbar-links">
      <router-link to="/" class="nav-link">Inicio</router-link>

      <router-link
        v-if="
          authStore.isAuthenticated &&
          (profilesStore.myProfile?.role?.name === 'admin' ||
            profilesStore.myProfile?.role?.name === 'super_admin')
        "
        to="/manage-series"
        class="nav-link"
      >
        Administrar Series
      </router-link>

      <router-link
        v-if="
          authStore.isAuthenticated &&
          (profilesStore.myProfile?.role?.name === 'admin' ||
            profilesStore.myProfile?.role?.name === 'super_admin')
        "
        to="/admin"
        class="nav-link"
      >
        Admin
      </router-link>

      <template v-if="!authStore.isAuthenticated">
        <router-link to="/login" class="nav-link auth-button">Iniciar Sesión</router-link>
        <router-link to="/register" class="nav-link auth-button">Registrarse</router-link>
      </template>

      <template v-else>
        <router-link to="/profile-settings" class="nav-link user-avatar-link">
          <img
            :src="authStore.profile?.avatar_url || defaultAvatarPath"
            alt="Avatar de usuario"
            class="user-avatar-small"
          />
        </router-link>

        <button
          @click="handleSignOut"
          :disabled="authStore.loading"
          class="nav-link auth-button logout-button"
        >
          {{ authStore.loading ? 'Cerrando...' : 'Cerrar Sesión' }}
        </button>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProfilesStore } from '../stores/profiles' // Asumiendo que profilesStore se usa para otras cosas de roles

const authStore = useAuthStore()
const profilesStore = useProfilesStore() // Mantenemos profilesStore para la lógica de roles
const router = useRouter()

// Ruta al avatar por defecto (desde la carpeta public)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const defaultAvatarPath =
  'https://hzremmurawbartxmpimt.supabase.co/storage/v1/object/public/user-avatars/avatars/default-avatar.png'

// La lógica para el avatar ahora se puede hacer directamente en el template
// o mantenerla aquí si necesitas más complejidad.
// userAvatar ya no es estrictamente necesario aquí si lo usas en el template.
// const userAvatar = computed(() => {
//   return profilesStore.myProfile?.avatar_url || defaultAvatarPath
// })

/**
 * @description Maneja el cierre de sesión del usuario.
 * Redirige a la página de login si el cierre de sesión es exitoso.
 */
const handleSignOut = async () => {
  console.log('handleSignOut function called')
  router.push('/login')
  const success = await authStore.signOut()
  if (success) {
    router.push('/login')
  } else {
    alert('Error al cerrar sesión.')
  }
}
</script>

<style scoped lang="scss">
@use 'sass:color'; // Importa el módulo de color
@use '@/assets/styles/_variables.scss' as vars; // Importa tus variables SCSS con el alias 'vars'

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: vars.$navbar-bg-color; // Usando variables
  padding: vars.$spacing-md vars.$spacing-xl; // Usando variables
  color: vars.$light-text-color; // Usando variables
  box-shadow: vars.$box-shadow-small; // Sombra sutil para la barra de navegación
}

.navbar-brand {
  .brand-link {
    color: vars.$light-text-color; // Usando variables
    text-decoration: none;
    font-size: 1.5em;
    font-weight: bold;
    letter-spacing: 1px;
    transition: color vars.$transition-speed vars.$transition-ease; // Usando variables

    &:hover {
      color: color.adjust(
        vars.$light-text-color,
        $lightness: 10%
      ); // Usando color.adjust y variables
    }
  }
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: vars.$spacing-lg; // Usando variables
}

.nav-link {
  color: vars.$light-text-color; // Usando variables
  text-decoration: none;
  font-size: 1.1em;
  padding: vars.$spacing-xs vars.$spacing-sm; // Usando variables
  border-radius: vars.$border-radius-sm; // Usando variables
  transition:
    background-color vars.$transition-speed vars.$transition-ease,
    color vars.$transition-speed vars.$transition-ease; // Usando variables
  display: flex; /* Para alinear el avatar y el texto */
  align-items: center;
  gap: vars.$spacing-xs; /* Espacio entre avatar y texto */
}

.nav-link:hover {
  background-color: #555; // Puedes convertir esto a una variable si lo usas mucho
}

/* Estilos específicos para botones de autenticación */
.auth-button {
  background-color: vars.$primary-color; // Usando variables
  border: none;
  cursor: pointer;
}

.auth-button:hover:not(:disabled) {
  background-color: color.adjust(
    vars.$primary-color,
    $lightness: -10%
  ); // Usando color.adjust y variables
}

.logout-button {
  background-color: vars.$danger-color; // Usando variables
}

.logout-button:hover:not(:disabled) {
  background-color: color.adjust(
    vars.$danger-color,
    $lightness: -10%
  ); // Usando color.adjust y variables
}

.logout-button:disabled {
  background-color: color.adjust(
    vars.$danger-color,
    $alpha: -0.5
  ); // Reduce la opacidad para deshabilitado
  cursor: not-allowed;
  opacity: 0.7; // Hace el botón un poco transparente
}

.user-info {
  color: vars.$light-text-color;
  font-size: 1.1em;
  // Ya tiene gap del .nav-link, no necesita margin-left adicional
}

.user-avatar-link {
  // Asegurarse de que el router-link que envuelve el avatar y el texto tenga un estilo consistente
  // Ya tiene `display: flex; align-items: center; gap: vars.$spacing-xs;` de .nav-link
}

.user-avatar-small {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid vars.$light-text-color; // Borde para destacar el avatar
  vertical-align: middle; // Alineación vertical
}
</style>
