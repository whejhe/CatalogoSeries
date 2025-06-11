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
        <span class="user-info"
          >Hola, {{ profilesStore.myProfile?.nick || authStore.userEmail }}</span
        >
        <button
          @click="handleSignOut"
          :disabled="authStore.loading"
          class="nav-link auth-button logout-button"
        >
          Cerrar Sesión
        </button>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProfilesStore } from '../stores/profiles'

const authStore = useAuthStore()
const profilesStore = useProfilesStore()
const router = useRouter()

/**
 * @description Maneja el cierre de sesión del usuario.
 */
const handleSignOut = async () => {
  const success = await authStore.signOut()
  if (success) {
    // Redirigir a la página de inicio o login después de cerrar sesión
    router.push('/login')
  }
  // No necesitas manejar el error aquí ya que el store de auth lo hace
}
</script>

<style scoped lang="scss">
@use 'sass:color'; // Importa el módulo de color
@use '@/assets/styles/_variables.scss' as vars; // Importa tus variables SCSS con el alias 'vars'

.navbar {
  background-color: #333; // Este color lo mantengo directo aquí, o puedes añadirlo a _variables.scss si lo usas en más sitios
  color: vars.$light-text-color; // Usando variables
  padding: vars.$spacing-md vars.$spacing-xl; // Usando variables
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: vars.$box-shadow-light; // Usando variables
}

.navbar-brand .brand-link {
  color: vars.$light-text-color; // Usando variables
  text-decoration: none;
  font-size: 1.8em;
  font-weight: bold;
  transition: color vars.$transition-speed vars.$transition-ease; // Usando variables
}

.navbar-brand .brand-link:hover {
  color: vars.$primary-color; // Usando variables
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
    $lightness: 20%
  ); // Usando color.adjust y variables
  cursor: not-allowed;
}

.user-info {
  font-size: 1.1em;
  margin-right: vars.$spacing-sm; // Usando variables
  color: #a0c9ff; // Puedes convertir esto a una variable si lo usas mucho
}
</style>
