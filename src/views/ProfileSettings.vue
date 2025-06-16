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
          {{ profilesStore.loading ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </form>

      <hr />

      <h2>Gestión de Avatar</h2>
      <div class="avatar-section">
        <img
          :src="authStore.profile?.avatar_url || defaultAvatarPath"
          alt="Avatar de usuario"
          class="user-avatar-preview"
        />
        <input
          type="file"
          @change="handleFileChange"
          accept="image/*"
          :disabled="profilesStore.loading"
        />
        <p v-if="uploadMessage" class="upload-message">{{ uploadMessage }}</p>
        <button @click="uploadNewAvatar" :disabled="!selectedFile || profilesStore.loading">
          {{ profilesStore.loading ? 'Subiendo...' : 'Subir Nuevo Avatar' }}
        </button>
        <button
          v-if="profilesStore.myProfile.avatar_url"
          @click="removeAvatar"
          :disabled="profilesStore.loading"
          class="delete-avatar-button"
        >
          {{ profilesStore.loading ? 'Eliminando...' : 'Eliminar Avatar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useProfilesStore } from '../stores/profiles'
import { useAuthStore } from '../stores/auth'

const profilesStore = useProfilesStore()
const authStore = useAuthStore()

// Ruta al avatar por defecto (desde la carpeta public)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const defaultAvatarPath =
  'https://hzremmurawbartxmpimt.supabase.co/storage/v1/object/public/user-avatars/avatars/default-avatar.png'

// Datos del formulario de perfil, inicializados con valores vacíos o nulos
const profileData = ref({
  nick: '',
  nombre: '',
  apellidos: '',
  edad: null,
})

// Para la subida de avatar
const selectedFile = ref(null) // Almacena el archivo File seleccionado
const uploadMessage = ref('') // Mensaje de estado para la subida del avatar

// Propiedad computada que devuelve la URL del avatar del usuario o la URL del avatar por defecto
const currentAvatarUrl = computed(() => {
  return authStore.profile?.avatar_url || defaultAvatarPath
})

/**
 * @description Carga los datos del perfil del store en el formulario local.
 * Se llama al montar el componente y cada vez que `profilesStore.myProfile` cambia.
 */
const loadProfileData = () => {
  if (profilesStore.myProfile) {
    profileData.value.nick = profilesStore.myProfile.nick || ''
    profileData.value.nombre = profilesStore.myProfile.nombre || ''
    profileData.value.apellidos = profilesStore.myProfile.apellidos || ''
    profileData.value.edad = profilesStore.myProfile.edad || null
  }
}

// Al montar el componente, intenta cargar el perfil si no está ya cargado
onMounted(async () => {
  if (!profilesStore.myProfile && authStore.isAuthenticated) {
    await profilesStore.fetchMyProfile()
  }
  loadProfileData() // Inicializa los datos del formulario con el perfil actual
})

// Observa los cambios en `profilesStore.myProfile` y actualiza los datos del formulario
watch(() => profilesStore.myProfile, loadProfileData)

/**
 * @description Maneja el envío del formulario para actualizar la información de texto del perfil.
 */
const updateProfileInfo = async () => {
  if (profilesStore.myProfile?.id) {
    const success = await profilesStore.updateProfile(profilesStore.myProfile.id, profileData.value)
    if (success) {
      alert('Perfil actualizado con éxito!')
    } else {
      alert('Error al actualizar el perfil.')
    }
  }
}

/**
 * @description Maneja el evento de cambio del input de tipo "file".
 * Guarda el archivo seleccionado en `selectedFile`.
 * @param {Event} event - El evento de cambio del input.
 */
const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
  uploadMessage.value = selectedFile.value ? `Archivo seleccionado: ${selectedFile.value.name}` : ''
}

/**
 * @description Sube el archivo de avatar seleccionado a Supabase Storage y actualiza la URL en el perfil.
 */
const uploadNewAvatar = async () => {
  if (!selectedFile.value) {
    uploadMessage.value = 'Por favor, selecciona un archivo primero.'
    return
  }
  if (!authStore.userId) {
    uploadMessage.value = 'Error: No se encontró el ID de usuario para subir el avatar.'
    return
  }

  uploadMessage.value = 'Subiendo avatar...'
  // Llama a la acción `uploadAvatar` del store de perfiles
  const newAvatarUrl = await profilesStore.uploadAvatar(selectedFile.value, authStore.userId)

  if (newAvatarUrl) {
    uploadMessage.value = 'Avatar subido y actualizado con éxito!'
    selectedFile.value = null // Limpiar el input file
    // Opcional: Volver a cargar el perfil para asegurarse de que la URL en el estado local se actualice
    // Aunque updateProfile ya lo hace, esto podría ser un doble chequeo.
    // await profilesStore.fetchMyProfile();
  } else {
    // Si hay un error en el store, lo muestra; de lo contrario, un mensaje genérico.
    uploadMessage.value = profilesStore.error || 'Fallo al subir el avatar.'
  }
}

/**
 * @description Elimina el avatar del perfil, estableciendo la URL a null en la base de datos
 * e intentando borrar el archivo del Storage.
 */
const removeAvatar = async () => {
  if (!profilesStore.myProfile?.id) {
    alert('Error: No se encontró el ID del perfil para eliminar el avatar.')
    return
  }

  // Pasa la URL actual del avatar para que la acción del store intente eliminar el archivo del Storage
  const oldAvatarUrl = profilesStore.myProfile.avatar_url

  const success = await profilesStore.deleteAvatar(profilesStore.myProfile.id, oldAvatarUrl)
  if (success) {
    alert('Avatar eliminado con éxito!')
    // El store ya actualiza `myProfile.avatar_url` a `null`, no es necesario recargar.
  } else {
    alert('Error al eliminar el avatar.')
  }
}
</script>

<style scoped lang="scss">
@use 'sass:color';
@use '@/assets/styles/_variables.scss' as vars;

.profile-settings-page {
  max-width: 700px;
  margin: vars.$spacing-lg auto;
  padding: vars.$spacing-xl;
  background-color: vars.$light-background-color;
  border-radius: vars.$border-radius-lg;
  box-shadow: vars.$box-shadow-medium;
}

h1 {
  color: vars.$primary-color;
  text-align: center;
  margin-bottom: vars.$spacing-xl;
  font-size: 2.2em;
}

h2 {
  color: vars.$dark-text-color;
  margin-top: vars.$spacing-xl;
  margin-bottom: vars.$spacing-md;
  border-bottom: 1px solid vars.$light-border-color;
  padding-bottom: vars.$spacing-sm;
}

form {
  display: flex;
  flex-direction: column;
  gap: vars.$spacing-md;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: bold;
  color: vars.$medium-text-color;
  margin-bottom: vars.$spacing-xs;
}

input[type='text'],
input[type='number'],
input[type='url'] {
  padding: vars.$spacing-sm;
  border: 1px solid vars.$light-border-color;
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

button[type='submit'] {
  background-color: vars.$primary-color;
  color: vars.$light-text-color;
  padding: vars.$spacing-sm vars.$spacing-md;
  border: none;
  border-radius: vars.$border-radius-sm;
  cursor: pointer;
  font-size: 1.1em;
  margin-top: vars.$spacing-md;
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
  margin-top: vars.$spacing-xl;
}

.user-avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid vars.$primary-color;
  box-shadow: vars.$box-shadow-small;
}

input[type='file'] {
  padding: vars.$spacing-sm;
  border: 1px solid vars.$light-border-color;
  border-radius: vars.$border-radius-sm;
  background-color: vars.$input-bg-color;
  width: 100%;
  max-width: 300px;
  cursor: pointer;
}

.delete-avatar-button {
  background-color: vars.$danger-color;
  color: vars.$light-text-color;
  padding: vars.$spacing-sm vars.$spacing-md;
  border: none;
  border-radius: vars.$border-radius-sm;
  cursor: pointer;
  font-size: 1em;
  margin-top: vars.$spacing-sm;
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
.error-message,
.upload-message {
  text-align: center;
  margin-top: vars.$spacing-md;
  font-weight: bold;
}

.error-message {
  color: vars.$danger-color;
}

.loading-message {
  color: vars.$medium-text-color;
}

.upload-message {
  color: vars.$primary-color; // Un color distintivo para mensajes de subida
}

hr {
  border: none;
  border-top: 1px solid vars.$light-border-color;
  margin: vars.$spacing-xl 0;
}
</style>
