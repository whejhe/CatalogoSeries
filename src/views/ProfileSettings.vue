<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useProfilesStore } from '../stores/profiles'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification' // Asegúrate de importar useToast

const profilesStore = useProfilesStore()
const authStore = useAuthStore()
const toast = useToast() // Inicializa el toast

// Asegúrate de que esta URL esté CORRECTA Y SIN COMILLAS EXTRA:
const defaultAvatarPath =
  'https://hzremmurawbartxmpimt.supabase.co/storage/v1/object/public/user-avatars/avatars/default-avatar.png'

const profileData = ref({
  nick: '',
  nombre: '',
  apellidos: '',
  edad: null,
})

const selectedFile = ref(null) // Para almacenar el archivo seleccionado por el usuario
const uploadMessage = ref('') // Para mensajes de estado de la subida

// Propiedad computada para determinar qué avatar mostrar
const currentAvatarUrl = computed(() => {
  // Si authStore.profile existe y tiene avatar_url, lo usamos. Si no, usamos el default.
  return authStore.profile?.avatar_url || defaultAvatarPath
})

// Watcher para cargar los datos del perfil cuando el store los tenga disponibles
watch(
  () => profilesStore.myProfile,
  (newProfile) => {
    if (newProfile) {
      profileData.value = {
        nick: newProfile.nick || '',
        nombre: newProfile.nombre || '',
        apellidos: newProfile.apellidos || '',
        edad: newProfile.edad || null,
      }
      // No necesitamos selectedFile aquí, ya que es para la nueva subida
    }
  },
  { immediate: true }, // Ejecuta el watcher inmediatamente si myProfile ya tiene valor al montar
)

// Función para manejar la selección de archivo
const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
  if (selectedFile.value) {
    uploadMessage.value = `Archivo seleccionado: ${selectedFile.value.name}`
  } else {
    uploadMessage.value = ''
  }
}

// Función para subir un nuevo avatar
const uploadNewAvatar = async () => {
  if (!selectedFile.value) {
    toast.error('Por favor, selecciona un archivo de imagen.')
    return
  }
  if (!authStore.userId) {
    // Asegúrate de tener el userId disponible
    toast.error('No se pudo obtener el ID del usuario. Por favor, inicia sesión de nuevo.')
    return
  }

  // Llama a la acción del store para subir el avatar
  const success = await profilesStore.uploadAvatar(selectedFile.value, authStore.userId)

  if (success) {
    // selectedFile.value se limpia aquí para resetear el input
    selectedFile.value = null
    // Esto es para que el input de tipo file se actualice visualmente.
    // Una forma común es usar una ref en el input y resetearlo, o un truco de clave.
    // Por ahora, simplemente limpiamos el mensaje.
    uploadMessage.value = ''

    // El currentAvatarUrl se actualizará reactivamente a través de authStore.profile.avatar_url
    // gracias a la llamada a profilesStore.uploadAvatar
  } else {
    // El error ya se maneja y muestra con toast dentro de profilesStore.uploadAvatar
    uploadMessage.value = 'Error al subir el avatar.'
  }
}

// Función para eliminar el avatar actual
const deleteCurrentAvatar = async () => {
  if (!authStore.profile || !profilesStore.myProfile?.id) {
    toast.error('No hay perfil para eliminar el avatar.')
    return
  }
  // Llama a la acción del store para eliminar el avatar
  // Pasamos el profileId y la URL actual para que el store maneje la eliminación del archivo
  const success = await profilesStore.deleteAvatar(
    profilesStore.myProfile.id,
    authStore.profile.avatar_url,
  )

  if (success) {
    // El currentAvatarUrl se actualizará reactivamente a null o al default
  } else {
    // El error ya se maneja y muestra con toast dentro de profilesStore.deleteAvatar
  }
}

// Función para actualizar la información básica del perfil
const updateProfileInfo = async () => {
  if (!profilesStore.myProfile?.id) {
    toast.error('No hay perfil para actualizar.')
    return
  }

  const updated = await profilesStore.updateProfile(profilesStore.myProfile.id, profileData.value)
  if (updated) {
    toast.success('Información del perfil actualizada.')
  } else {
    // El error ya se maneja con toast dentro de profilesStore.updateProfile
  }
}

// Al montar el componente, asegura que el perfil del usuario autenticado se cargue
onMounted(async () => {
  // Solo carga el perfil si no está ya cargado para evitar llamadas redundantes
  if (!profilesStore.myProfile) {
    await profilesStore.fetchMyProfile()
  }
})
</script>

<template>
  <div class="profile-settings-page page-card">
    <h1>Configuración de Perfil</h1>
    <p v-if="profilesStore.loading" class="loading-message">Cargando perfil...</p>
    <p v-if="profilesStore.error" class="error-message">{{ profilesStore.error }}</p>

    <div v-if="profilesStore.myProfile">
      <form @submit.prevent="updateProfileInfo">
        <div class="form-group">
          <label for="nick">Nick:</label>
          <input
            type="text"
            id="nick"
            v-model="profileData.nick"
            required
            :disabled="profilesStore.loading"
          />
        </div>
        <div class="form-group">
          <label for="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            v-model="profileData.nombre"
            :disabled="profilesStore.loading"
          />
        </div>
        <div class="form-group">
          <label for="apellidos">Apellidos:</label>
          <input
            type="text"
            id="apellidos"
            v-model="profileData.apellidos"
            :disabled="profilesStore.loading"
          />
        </div>
        <div class="form-group">
          <label for="edad">Edad:</label>
          <input
            type="number"
            id="edad"
            v-model.number="profileData.edad"
            :disabled="profilesStore.loading"
          />
        </div>

        <button type="submit" :disabled="profilesStore.loading">
          {{ profilesStore.loading ? 'Guardando...' : 'Actualizar Perfil' }}
        </button>
      </form>

      <hr />
      <h2>Gestión de Avatar</h2>
      <div class="avatar-section">
        <img :src="currentAvatarUrl" alt="Avatar de usuario" class="user-avatar-preview" />

        <div class="upload-avatar-controls">
          <label for="avatar-upload" class="file-upload-label button">
            Seleccionar nuevo avatar
          </label>
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            @change="handleFileChange"
            :disabled="profilesStore.loading"
            style="display: none"
          />
          <span v-if="uploadMessage" class="upload-message">{{ uploadMessage }}</span>
          <button
            @click="uploadNewAvatar"
            :disabled="!selectedFile || profilesStore.loading"
            class="action-button"
          >
            {{ profilesStore.loading ? 'Subiendo...' : 'Subir Avatar' }}
          </button>
        </div>

        <button
          @click="deleteCurrentAvatar"
          :disabled="
            !authStore.profile?.avatar_url ||
            profilesStore.loading ||
            authStore.profile?.avatar_url === defaultAvatarPath
          "
          class="delete-avatar-button"
        >
          {{ profilesStore.loading ? 'Eliminando...' : 'Eliminar Avatar Actual' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/styles/variables' as vars;
@use 'sass:color';

.profile-settings-page {
  padding: vars.$spacing-lg;
  max-width: 800px;
  margin: vars.$spacing-xl auto;
}

h1,
h2 {
  color: vars.$dark-text-color;
  margin-bottom: vars.$spacing-md;
  text-align: center;
}

hr {
  border: 0;
  height: 1px;
  background-color: vars.$light-border-color;
  margin: vars.$spacing-lg 0;
}

.form-group {
  margin-bottom: vars.$spacing-md;

  label {
    display: block;
    margin-bottom: vars.$spacing-sm;
    color: vars.$dark-text-color;
    font-weight: bold;
  }

  input[type='text'],
  input[type='number'] {
    width: 100%;
    padding: vars.$spacing-sm;
    border: 1px solid vars.$light-border-color;
    border-radius: vars.$border-radius-sm;
    background-color: vars.$input-bg-color;
    color: vars.$dark-text-color;
    transition: border-color vars.$transition-speed;

    &:focus {
      border-color: vars.$primary-color;
      outline: none;
    }

    &:disabled {
      background-color: vars.$disabled-bg-color;
      color: vars.$medium-text-color;
      cursor: not-allowed;
    }
  }
}

button[type='submit'],
.action-button {
  background-color: vars.$primary-color;
  color: vars.$light-text-color;
  padding: vars.$spacing-sm vars.$spacing-md;
  border: none;
  border-radius: vars.$border-radius-sm;
  cursor: pointer;
  font-size: 1em;
  margin-top: vars.$spacing-sm;
  transition: background-color vars.$transition-speed vars.$transition-ease;

  &:hover:not(:disabled) {
    background-color: color.adjust(vars.$primary-color, $lightness: -10%);
  }

  &:disabled {
    background-color: vars.$disabled-bg-color;
    cursor: not-allowed;
    color: color.adjust(vars.$medium-text-color, $lightness: 20%);
  }
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: vars.$spacing-md;
  margin-bottom: vars.$spacing-xl;
}

.user-avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid vars.$primary-color;
  box-shadow: vars.$box-shadow-small;
}

.upload-avatar-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: vars.$spacing-sm;
  width: 100%;
  max-width: 300px; /* Para mantener los controles centrados y no demasiado anchos */
}

.file-upload-label {
  // Estilo como botón
  background-color: vars.$secondary-color;
  color: vars.$light-text-color;
  padding: vars.$spacing-sm vars.$spacing-md;
  border: none;
  border-radius: vars.$border-radius-sm;
  cursor: pointer;
  font-size: 1em;
  transition: background-color vars.$transition-speed vars.$transition-ease;
  width: 100%; // Ocupa el ancho máximo dentro de su contenedor
  text-align: center;

  &:hover {
    background-color: color.adjust(vars.$secondary-color, $lightness: -10%);
  }
}

.upload-message {
  font-size: 0.9em;
  color: vars.$medium-text-color;
}

.delete-avatar-button {
  background-color: vars.$danger-color;
  color: vars.$light-text-color;
  padding: vars.$spacing-sm vars.$spacing-md;
  border: none;
  border-radius: vars.$border-radius-sm;
  cursor: pointer;
  font-size: 1em;
  margin-top: vars.$spacing-sm; // Espacio entre los botones de subir y eliminar
  transition: background-color vars.$transition-speed vars.$transition-ease;

  &:hover:not(:disabled) {
    background-color: color.adjust(vars.$danger-color, $lightness: -10%);
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
}

.error-message {
  color: vars.$danger-color;
}

@media (max-width: 600px) {
  .profile-settings-page {
    padding: vars.$spacing-md;
  }
}
</style>
