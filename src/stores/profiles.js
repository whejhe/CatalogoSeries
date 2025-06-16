// src/stores/profiles.js
import { defineStore } from 'pinia'
import { supabase } from '../supabase'
import { useAuthStore } from './auth' // Asegúrate de que esta ruta sea correcta para tu store de autenticación
import { useToast } from 'vue-toastification'
import { uploadFile, deleteFile } from '../stores/storageService'

export const useProfilesStore = defineStore('profiles', {
  state: () => ({
    profiles: [], // Aquí almacenaremos todos los perfiles
    myProfile: null, // Almacenará el perfil del usuario actualmente autenticado
    loading: false,
    error: null,
  }),
  actions: {
    /**
     * @description Obtiene todos los perfiles de usuario junto con su rol.
     */
    async fetchAllProfiles() {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.from('profiles').select(`
            id,
            user_id,
            nombre,
            apellidos,
            nick,
            edad,
            avatar_url,
            created_at,
            role:role_id(name) // Selecciona el nombre del rol a través de la relación
          `)

        if (error) throw error

        this.profiles = data
        console.log('Perfiles cargados:', this.profiles)
      } catch (error) {
        this.error = error.message
        console.error('Error al cargar perfiles:', error.message)
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Obtiene el perfil del usuario actualmente logeado.
     * Esto asume que el usuario ya está autenticado.
     */
    async fetchMyProfile() {
      this.loading = true
      this.error = null
      const authStore = useAuthStore() // Obtén una instancia del store de autenticación

      if (!authStore.user) {
        // Si no hay usuario autenticado, no hay perfil que cargar
        this.myProfile = null
        authStore.profile = null // Asegúrate de que el perfil en authStore también esté limpio
        this.loading = false
        console.log('fetchMyProfile: No hay usuario autenticado para cargar el perfil.')
        return
      }

      console.log('fetchMyProfile: Intentando cargar perfil para user ID:', authStore.user.id)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*') // Selecciona todas las columnas del perfil
          .eq('user_id', authStore.user.id) // Filtra por el user_id del usuario autenticado
          .single() // Espera un único resultado

        if (error) {
          // Si el perfil no existe para el user_id, data será null y error contendrá un mensaje.
          // Solo lanzamos el error si no es el caso de "no rows found"
          if (error.code === 'PGRST116') {
            // Código de error para "no rows found" en PostgREST
            console.warn(
              'fetchMyProfile: No se encontró perfil para este usuario. Es posible que sea un usuario nuevo.',
            )
            this.myProfile = null
            authStore.profile = null
          } else {
            throw error
          }
        } else {
          this.myProfile = data
          // También sincroniza el perfil con el authStore si lo usas en otros componentes
          authStore.profile = { ...data, email: authStore.user.email } // Asumiendo que el email está en authStore.user
          console.log(
            'fetchMyProfile: Mi perfil cargado y sincronizado con AuthStore: ',
            this.myProfile,
          )
        }
      } catch (error) {
        this.error = error.message
        console.error('fetchMyProfile: Error al cargar mi perfil:', error.message)
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Actualiza la información de un perfil de usuario.
     * @param {string} profileId - El ID del perfil a actualizar.
     * @param {Object} updatedData - Los datos a actualizar.
     */
    async updateProfile(profileId, updatedData) {
      this.loading = true
      this.error = null
      const toast = useToast()
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updatedData)
          .eq('id', profileId)
          .select() // Importante para obtener los datos actualizados
          .single()

        if (error) throw error

        this.myProfile = data // Actualiza el estado local con los nuevos datos
        const authStore = useAuthStore()
        authStore.profile = { ...data, email: authStore.user?.email } // Actualiza también el authStore

        toast.success('Perfil actualizado con éxito.')
        return true
      } catch (err) {
        this.error = err.message
        toast.error('Error al actualizar perfil: ' + err.message)
        console.error('Error al actualizar perfil:', err.message)
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Sube un nuevo archivo de avatar y actualiza la URL del perfil.
     * @param {File} file - El objeto de archivo a subir.
     * @param {string} userId - El ID del usuario propietario del avatar.
     * @returns {Promise<boolean>} True si la subida fue exitosa, false en caso contrario.
     */
    async uploadAvatar(file, userId) {
      this.loading = true
      this.error = null
      const toast = useToast()
      const authStore = useAuthStore()

      try {
        // Si el usuario ya tiene un avatar, primero intentamos eliminar el antiguo del storage
        if (this.myProfile?.avatar_url) {
          console.log(
            'profilesStore: Eliminando avatar antiguo antes de subir el nuevo:',
            this.myProfile.avatar_url,
          )
          // Usamos una promesa para no bloquear la subida si falla la eliminación del antiguo
          // La eliminación es 'best effort', no queremos que impida la subida del nuevo.
          deleteFile(this.myProfile.avatar_url)
            .then((success) => {
              if (!success)
                console.warn(
                  'profilesStore: No se pudo eliminar el archivo de avatar antiguo del Storage.',
                )
            })
            .catch((err) => console.error('profilesStore: Error al eliminar avatar antiguo:', err))
        }

        console.log('profilesStore: Intentando subir nuevo avatar...')
        const newAvatarUrl = await uploadFile(file, userId) // Llama al servicio externo

        if (!newAvatarUrl) {
          throw new Error('No se pudo obtener la URL del avatar subido.')
        }

        // Actualizar la URL del avatar en la tabla 'profiles'
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: newAvatarUrl })
          .eq('user_id', userId) // Asegúrate de actualizar por user_id

        if (updateError) throw updateError

        // Actualizar el estado local del perfil y en el authStore
        if (this.myProfile) {
          this.myProfile.avatar_url = newAvatarUrl
        }
        if (authStore.profile) {
          authStore.profile.avatar_url = newAvatarUrl
        }

        toast.success('Avatar subido con éxito.')
        console.log('profilesStore: Avatar subido y perfil actualizado.')
        return true
      } catch (err) {
        this.error = 'Error al subir el avatar: ' + err.message
        toast.error(this.error)
        console.error('profilesStore: Error en uploadAvatar:', err.message)
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Elimina el avatar actual de un perfil.
     * @param {string} profileId - El ID del perfil cuyo avatar se eliminará.
     * @param {string} avatarUrlToDelete - La URL pública del avatar a eliminar del Storage.
     * @returns {Promise<boolean>} True si la eliminación fue exitosa, false en caso contrario.
     */
    async deleteAvatar(profileId, avatarUrlToDelete) {
      this.loading = true
      this.error = null
      const toast = useToast()
      const authStore = useAuthStore()

      try {
        // 1. Eliminar el archivo del Storage si se proporcionó una URL válida
        if (avatarUrlToDelete) {
          console.log('profilesStore: Intentando eliminar avatar del Storage:', avatarUrlToDelete)
          await deleteFile(avatarUrlToDelete) // Llama al servicio externo
        }

        // 2. Actualizar la URL del avatar en la tabla 'profiles' a null
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: null })
          .eq('id', profileId)

        if (updateError) throw updateError

        // 3. Actualizar el estado local y el authStore
        if (this.myProfile) {
          this.myProfile.avatar_url = null
        }
        if (authStore.profile) {
          authStore.profile.avatar_url = null
        }

        toast.success('Avatar eliminado con éxito.')
        console.log('profilesStore: Avatar eliminado del perfil.')
        return true
      } catch (err) {
        this.error = 'Error al eliminar el avatar: ' + err.message
        toast.error(this.error)
        console.error('profilesStore: Error en deleteAvatar:', err.message)
        return false
      } finally {
        this.loading = false
      }
    },
  },
})
