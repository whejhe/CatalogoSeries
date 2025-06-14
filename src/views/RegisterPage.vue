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
        <label for="confirmPassword">Confirmar Contraseña:</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          required
          :disabled="authStore.loading"
        />
        <p v-if="passwordMismatch" class="error-message">Las contraseñas no coinciden.</p>
      </div>
      <div class="form-group">
        <label for="nick">Nick:</label>
        <input type="text" id="nick" v-model="nick" required :disabled="authStore.loading" />
      </div>
      <div class="form-group">
        <label for="nombre">Nombre:</label>
        <input type="text" id="nombre" v-model="nombre" :disabled="authStore.loading" />
      </div>
      <div class="form-group">
        <label for="apellidos">Apellidos:</label>
        <input type="text" id="apellidos" v-model="apellidos" :disabled="authStore.loading" />
      </div>
      <div class="form-group">
        <label for="edad">Edad:</label>
        <input type="number" id="edad" v-model="edad" :disabled="authStore.loading" />
        <p v-if="invalidAge" class="error-message">La edad debe ser un número positivo.</p>
      </div>

      <div class="form-group">
        <label for="avatar">Avatar:</label>
        <input
          type="file"
          id="avatar"
          @change="handleAvatarChange"
          accept="image/*"
          :disabled="authStore.loading"
        />
      </div>

      <p v-if="authStore.loading" class="loading-message">Registrando...</p>
      <button type="submit" :disabled="authStore.loading || passwordMismatch || invalidAge">
        {{ authStore.loading ? 'Cargando...' : 'Registrarse' }}
      </button>
    </form>
    <p class="switch-auth">
      ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión aquí</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const nick = ref('')
const nombre = ref('') // Nuevo campo
const apellidos = ref('') // Nuevo campo
const edad = ref(null) // Nuevo campo, inicializado a null
const avatarFile = ref(null) // Para el archivo del avatar

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const passwordMismatch = computed(() => {
  return password.value !== confirmPassword.value && confirmPassword.value !== ''
})

const invalidAge = computed(() => {
  // Solo si edad tiene un valor, y es un número no positivo
  return edad.value !== null && edad.value !== '' && (isNaN(edad.value) || edad.value <= 0)
})

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    avatarFile.value = file
  } else {
    avatarFile.value = null
  }
}

const handleRegister = async () => {
  if (passwordMismatch.value) {
    toast.error('Las contraseñas no coinciden.')
    return
  }

  if (invalidAge.value) {
    toast.error('La edad debe ser un número positivo válido.')
    return
  }

  // Llamada a la acción signUp del store con todos los nuevos campos
  const success = await authStore.signUp(
    email.value,
    password.value,
    nick.value,
    nombre.value,
    apellidos.value,
    edad.value,
    avatarFile.value, // Pasar el archivo directamente
  )
  if (success) {
    router.push('/')
  }
}
</script>

<style scoped lang="scss">
@use 'sass:color';
@use '@/assets/styles/_variables.scss' as vars;

.register-page {
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
input[type='password'],
input[type='text'],
input[type='number'], /* Nuevo tipo de input para la edad */
input[type='file'] {
  /* Nuevo tipo de input para el avatar */
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
  background-color: vars.$success-color;
  color: vars.$light-text-color;
  padding: vars.$spacing-sm vars.$spacing-md;
  border: none;
  border-radius: vars.$border-radius-sm;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color vars.$transition-speed vars.$transition-ease;

  &:hover:not(:disabled) {
    background-color: color.adjust(vars.$success-color, $lightness: -10%);
  }

  &:disabled {
    background-color: vars.$disabled-bg-color;
    cursor: not-allowed;
    color: color.adjust(vars.$medium-text-color, $lightness: 20%);
  }
}

.loading-message,
.error-message {
  text-align: center;
  margin-top: vars.$spacing-md;
  font-weight: bold;
  width: 100%;
}

.error-message {
  color: vars.$danger-color;
}
</style>
