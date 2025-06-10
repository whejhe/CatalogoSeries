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

<style scoped>
.navbar {
  background-color: #333;
  color: white;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.navbar-brand .brand-link {
  color: white;
  text-decoration: none;
  font-size: 1.8em;
  font-weight: bold;
  transition: color 0.3s ease;
}

.navbar-brand .brand-link:hover {
  color: #007bff; /* Un tono de azul para el hover */
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 20px; /* Espacio entre los enlaces */
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 1.1em;
  padding: 8px 12px;
  border-radius: 5px;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.nav-link:hover {
  background-color: #555;
}

/* Estilos específicos para botones de autenticación */
.auth-button {
  background-color: #007bff;
  border: none;
  cursor: pointer;
}

.auth-button:hover {
  background-color: #0056b3;
}

.logout-button {
  background-color: #dc3545; /* Rojo para cerrar sesión */
}

.logout-button:hover {
  background-color: #c82333;
}

.logout-button:disabled {
  background-color: #f0a3ab;
  cursor: not-allowed;
}

.user-info {
  font-size: 1.1em;
  margin-right: 10px;
  color: #a0c9ff; /* Un color ligeramente diferente para el nombre de usuario */
}
</style>
