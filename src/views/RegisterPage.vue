<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Regístrate</h1>
      <form @submit.prevent="handleRegister">
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
            autocomplete="new-password"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña:</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            autocomplete="new-password"
          />
        </div>

        <button type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? 'Registrando...' : 'Registrar' }}
        </button>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="authStore.authError" class="error-message">{{ authStore.authError }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </form>
      <p class="auth-link">
        ¿Ya tienes una cuenta? <router-link to="/login">Inicia Sesión aquí</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router' // Necesitas importar useRouter para usar el router
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter() // <--- Aquí es donde se asigna 'router'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  authStore.authError = null

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  const success = await authStore.signUp(email.value, password.value)

  if (success) {
    successMessage.value = 'Registro exitoso. ¡Bienvenido!'
    // --- LÍNEA AÑADIDA/MODIFICADA PARA USAR 'router' ---
    // Opcional: Redirigir al usuario a la página de inicio o a un dashboard
    // Lo más común es redirigir a la página de inicio de sesión para que el usuario inicie sesión
    // o directamente al dashboard si la confirmación de email no es requerida inmediatamente.
    setTimeout(() => {
      // Un pequeño retraso para que el usuario vea el mensaje de éxito
      router.push('/login') // <-- Aquí se usa 'router' para redirigir
    }, 1500) // Redirige después de 1.5 segundos
    // ----------------------------------------------------
  } else {
    // El error ya se habrá guardado en authStore.authError
  }
}
</script>

<style scoped>
/* Estilos comunes para las páginas de autenticación */
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

.success-message {
  color: #28a745;
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
