<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Inicia Sesión</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Correo Electrónico:</label>
          <input type="email" id="email" v-model="email" required autocomplete="email" />
        </div>
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            autocomplete="current-password"
          />
        </div>

        <button type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? 'Iniciando...' : 'Iniciar Sesión' }}
        </button>

        <p v-if="authStore.authError" class="error-message">{{ authStore.authError }}</p>
      </form>
      <p class="auth-link">
        ¿No tienes una cuenta? <router-link to="/register">Regístrate aquí</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth' // Asegúrate de que la ruta sea correcta

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')

/**
 * @description Maneja el envío del formulario de inicio de sesión.
 */
const handleLogin = async () => {
  authStore.authError = null // Resetear errores del store de autenticación

  // Llamar a la acción signIn del store de autenticación
  const success = await authStore.signIn(email.value, password.value)

  if (success) {
    console.log('Inicio de sesión exitoso, redirigiendo...')
    router.push('/') // Redirigir a la página de inicio (o a donde desees)
  } else {
    // El error ya se habrá guardado en authStore.authError
    // No necesitamos hacer nada aquí porque el template ya lo muestra
  }
}
</script>

<style scoped>
/* Estos estilos ya se definieron en RegisterPage.vue y podrían ir en un archivo CSS común si lo prefieres */
/* Para simplificar, los he duplicado aquí por ahora. */
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px); /* Ajusta si tienes header/footer */
  background-color: #f0f2f5;
  padding: 20px;
}

.auth-card {
  background-color: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  font-size: 2em;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: bold;
}

.form-group input {
  width: calc(100% - 20px);
  padding: 12px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box; /* Incluye padding en el ancho */
}

button[type='submit'] {
  width: 100%;
  padding: 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 20px;
}

button[type='submit']:hover:not(:disabled) {
  background-color: #0056b3;
}

button[type='submit']:disabled {
  background-color: #a0c9ff;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin-top: 15px;
  font-size: 0.9em;
}

.auth-link {
  margin-top: 25px;
  font-size: 0.95em;
  color: #666;
}

.auth-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>
