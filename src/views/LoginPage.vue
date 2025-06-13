<template>
  <div class="login-page page-card">
    <h1>Iniciar Sesión</h1>
    <form @submit.prevent="handleLogin">
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
      <p v-if="authStore.loading" class="loading-message">Iniciando sesión...</p>
      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Cargando...' : 'Iniciar Sesión' }}
      </button>
    </form>
    <p class="switch-auth">
      ¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  // La notificación toast se activará automáticamente dentro de la acción authStore.signIn.
  const success = await authStore.signIn(email.value, password.value)
  if (success) {
    router.push('/') // Redirigir a la página de inicio tras el login exitoso
  }
}
</script>

<style scoped lang="scss">
@use 'sass:color';
@use '@/assets/styles/_variables.scss' as vars;

.login-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: vars.$spacing-lg;
  max-width: 500px;
}

h1 {
  color: vars.$primary-color;
  margin-bottom: vars.$spacing-xl;
  font-size: 2em;
}

form {
  width: 100%;
}

.switch-auth {
  margin-top: vars.$spacing-lg;
  font-size: 1em;
  color: vars.$medium-text-color;

  a {
    color: vars.$primary-color;
    text-decoration: none;
    font-weight: bold;
    transition: color vars.$transition-speed vars.$transition-ease;

    &:hover {
      color: color.adjust(vars.$primary-color, $lightness: -10%);
    }
  }
}

button[type='submit'] {
  width: 100%;
  margin-top: vars.$spacing-lg;
  background-color: vars.$primary-color;

  &:hover:not(:disabled) {
    background-color: color.adjust(vars.$primary-color, $lightness: -10%);
  }

  &:disabled {
    background-color: color.adjust(vars.$primary-color, $lightness: 20%);
    cursor: not-allowed;
  }
}

.loading-message {
  text-align: center;
  margin-top: vars.$spacing-md;
  font-weight: bold;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: vars.$spacing-md;
}

label {
  font-weight: bold;
  color: vars.$dark-text-color;
  margin-bottom: vars.$spacing-xs;
}

input[type='email'],
input[type='password'] {
  padding: vars.$spacing-sm;
  border: 1px solid vars.$border-color;
  border-radius: vars.$border-radius-sm;
  font-size: 1em;
  color: vars.$dark-text-color;
  background-color: vars.$input-bg-color;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  &:focus {
    border-color: vars.$primary-color;
    box-shadow: 0 0 0 3px rgba(vars.$primary-color, 0.2);
    outline: none;
  }

  &:disabled {
    background-color: vars.$disabled-bg-color;
    cursor: not-allowed;
    color: color.adjust(vars.$medium-text-color, $lightness: 20%);
  }
}
</style>
