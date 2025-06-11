<template>
  <div class="register-page page-card">
    <h1>Registrarse</h1>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required :disabled="authStore.loading" />
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          :disabled="authStore.loading"
        />
      </div>
      <div class="form-group">
        <label for="nick">Nick:</label>
        <input type="text" id="nick" v-model="nick" required :disabled="authStore.loading" />
      </div>
      <p v-if="authStore.error" class="error-message">{{ authStore.error }}</p>
      <p v-if="authStore.loading" class="loading-message">Registrando...</p>
      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Cargando...' : 'Registrarse' }}
      </button>
    </form>
    <p class="switch-auth">
      ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión aquí</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const nick = ref('') // Campo para el nick
const authStore = useAuthStore()
const router = useRouter()

const handleRegister = async () => {
  const success = await authStore.signUp(email.value, password.value, nick.value) // Pasa también el nick
  if (success) {
    router.push('/') // Redirigir a la página de inicio tras el registro exitoso
  }
}
</script>

<style scoped lang="scss">
@use 'sass:color'; // Importa el módulo de color
@use '@/assets/styles/_variables.scss' as vars; // Importa tus variables SCSS con el alias 'vars'

.register-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: vars.$spacing-lg; // Usando variables
  max-width: 500px; /* Ancho máximo para el formulario de registro */
}

h1 {
  color: vars.$primary-color; // Usando variables
  margin-bottom: vars.$spacing-xl; // Usando variables
  font-size: 2em;
}

form {
  width: 100%;
}

.switch-auth {
  margin-top: vars.$spacing-lg; // Usando variables
  font-size: 1em;
  color: vars.$medium-text-color; // Usando variables

  a {
    color: vars.$primary-color; // Usando variables
    text-decoration: none;
    font-weight: bold;
    transition: color vars.$transition-speed vars.$transition-ease; // Usando variables

    &:hover {
      color: color.adjust(vars.$primary-color, $lightness: -10%); // Usando color.adjust y variables
    }
  }
}

button[type='submit'] {
  width: 100%;
  margin-top: vars.$spacing-lg; // Usando variables
  background-color: vars.$success-color; // Usando variables

  &:hover:not(:disabled) {
    background-color: color.adjust(
      vars.$success-color,
      $lightness: -10%
    ); // Usando color.adjust y variables
  }

  &:disabled {
    background-color: color.adjust(
      vars.$success-color,
      $lightness: 20%
    ); // Usando color.adjust y variables
    cursor: not-allowed;
  }
}
</style>
