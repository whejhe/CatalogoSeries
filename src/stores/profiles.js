// src/stores/profiles.js
import { defineStore } from 'pinia'
import { supabase } from '../supabase'

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
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          this.myProfile = null
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select(
            `
            id,
            user_id,
            nombre,
            apellidos,
            nick,
            edad,
            avatar_url,
            created_at,
            role:role_id(name) // Selecciona el nombre del rol a través de la relación
          `,
          )
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        // Añadir el email del usuario de auth a myProfile para tenerlo todo junto
        this.myProfile = { ...data, email: user.email }
        console.log('Mi perfil cargado:', this.myProfile)
      } catch (error) {
        this.error = error.message
        console.error('Error al cargar mi perfil:', error.message)
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Actualiza la información de un perfil (nombre, apellidos, nick, edad).
     * @param {string} profileId - El ID del perfil a actualizar.
     * @param {Object} updatedData - Los campos a actualizar (ej. { nombre: 'Nuevo Nombre' }).
     */
    async updateProfile(profileId, updatedData) {
      this.loading = true
      this.error = null
      try {
        // Realiza la actualización en la base de datos
        const { data, error } = await supabase
          .from('profiles')
          .update(updatedData)
          .eq('id', profileId)
          .select(
            // Vuelve a seleccionar los datos del perfil actualizado
            `
            id,
            user_id,
            nombre,
            apellidos,
            nick,
            edad,
            avatar_url,
            created_at,
            role:role_id(name) // Asegúrate de traer el rol actualizado también
          `,
          )
          .single()

        if (error) throw error

        // Si se actualizó el propio perfil del usuario logeado, actualiza myProfile en el store
        if (this.myProfile && this.myProfile.id === profileId) {
          // Asegúrate de mantener el email del usuario si no se actualiza en esta operación de perfil
          this.myProfile = { ...data, email: this.myProfile.email }
        }

        console.log('Perfil actualizado:', data)
        return true // Indica que la actualización fue exitosa
      } catch (error) {
        this.error = error.message
        console.error('Error al actualizar perfil:', error.message)
        return false // Indica que hubo un fallo en la actualización
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Asigna un rol a un perfil de usuario.
     * @param {string} profileId - El ID del perfil al que asignar el rol.
     * @param {string} roleName - El nombre del rol a asignar (ej. 'admin', 'user').
     */
    async assignRoleToProfile(profileId, roleName) {
      this.loading = true
      this.error = null
      try {
        // 1. Primero, obtener el ID del rol a partir de su nombre
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', roleName)
          .single()

        if (roleError) throw roleError
        if (!roleData) throw new Error(`Rol '${roleName}' no encontrado.`)

        const roleId = roleData.id

        // 2. Luego, actualizamos el role_id del perfil con el ID obtenido
        const { data, error } = await supabase
          .from('profiles')
          .update({ role_id: roleId })
          .eq('id', profileId)
          .select(
            // Selecciona el perfil actualizado con el nombre del rol
            `
            id,
            user_id,
            nombre,
            apellidos,
            nick,
            edad,
            avatar_url,
            created_at,
            role:role_id(name)
          `,
          )
          .single()

        if (error) throw error

        // Si se actualizó el propio perfil del usuario logeado, actualiza myProfile
        if (this.myProfile && this.myProfile.id === profileId) {
          this.myProfile = { ...data, email: this.myProfile.email } // Mantener el email
        }

        console.log(`Rol '${roleName}' asignado al perfil ${profileId}.`)
        return true
      } catch (error) {
        this.error = error.message
        console.error('Error al asignar rol:', error.message)
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Sube un archivo de avatar a Supabase Storage y actualiza la URL en el perfil.
     * El nombre del archivo se construye con el ID del usuario y un timestamp para ser único.
     * El archivo se guarda en el bucket 'avatars' dentro de una subcarpeta 'avatars/'
     * (Supabase por defecto usa el nombre del bucket como carpeta raíz dentro del Storage).
     * @param {File} file - El objeto File del avatar a subir (ej. de un input type="file").
     * @param {string} userId - El ID del usuario asociado al avatar (del authStore).
     * @returns {string|null} La URL pública del avatar o null si falla la operación.
     */
    async uploadAvatar(file, userId) {
      this.loading = true
      this.error = null
      try {
        if (!file || !userId) {
          throw new Error('Archivo y ID de usuario son requeridos para subir el avatar.')
        }

        const fileExt = file.name.split('.').pop() // Obtiene la extensión del archivo (ej. 'png', 'jpg')
        // Genera un nombre de archivo único para evitar colisiones
        const fileName = `${userId}-${Date.now()}.${fileExt}`
        // Define la ruta completa dentro del bucket 'avatars'.
        // Supabase Storage almacena los archivos dentro de una carpeta con el nombre del bucket por defecto.
        const filePath = `avatars/${fileName}`

        // 1. Subir el archivo al bucket 'avatars' en Supabase Storage
        // 'cacheControl': cuánto tiempo el navegador puede cachear el archivo (3600 segundos = 1 hora)
        // 'upsert: true': Si un archivo con la misma ruta ya existe, lo sobrescribe.
        const { error: uploadError } = await supabase.storage
          .from('avatars') // Asegúrate de tener un bucket llamado 'avatars' en Supabase Storage
          .upload(filePath, file, { cacheControl: '3600', upsert: true })

        if (uploadError) throw uploadError

        // 2. Obtener la URL pública del archivo subido. Esta es la URL que guardarás en tu BBDD.
        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath)

        if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error('No se pudo obtener la URL pública del avatar.')
        }
        const avatarUrl = publicUrlData.publicUrl

        // 3. Actualizar la URL del avatar en la tabla 'profiles' del usuario
        // Llama a la acción interna 'updateProfile' para manejar la actualización de la base de datos
        await this.updateProfile(this.myProfile.id, { avatar_url: avatarUrl })

        console.log('Avatar subido y perfil actualizado:', avatarUrl)
        return avatarUrl // Devuelve la URL pública del nuevo avatar
      } catch (error) {
        this.error = error.message
        console.error('Error al subir o actualizar avatar:', error.message)
        return null // Indica un fallo
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Elimina el avatar de un perfil, estableciendo 'avatar_url' a null.
     * Opcionalmente, también intenta eliminar el archivo del Storage si se proporciona la URL antigua.
     * NOTA: La eliminación del Storage es experimental aquí debido a la complejidad de extraer la ruta.
     * Para una implementación más robusta, considera guardar la 'filePath' del Storage directamente en la BBDD.
     * @param {string} profileId - El ID del perfil cuyo avatar se eliminará.
     * @param {string} [oldAvatarUrl] - La URL pública del avatar anterior para intentar eliminarlo del Storage.
     */
    async deleteAvatar(profileId, oldAvatarUrl = null) {
      this.loading = true
      this.error = null
      try {
        // 1. Opcionalmente, intentar eliminar el archivo del Storage
        if (oldAvatarUrl) {
          // Extrae el 'filePath' de la URL pública.
          // Ejemplo de URL pública de Supabase:
          // https://[project_ref].supabase.co/storage/v1/object/public/avatars/avatars/user_id-timestamp.png
          // Necesitamos la parte 'avatars/user_id-timestamp.png' para el método .remove()
          try {
            const url = new URL(oldAvatarUrl)
            // La ruta completa después de /public/ es lo que necesitamos.
            // Esto incluye el nombre del bucket y el path del archivo.
            // Asumimos que la estructura es /public/[bucket_name]/[path_in_bucket]
            const pathInPublicStorage = url.pathname.split('/public/')[1] // 'avatars/avatars/user_id-timestamp.png'
            // Ahora, necesitamos la ruta relativa al bucket 'avatars', que sería 'avatars/user_id-timestamp.png'
            const filePathInStorage = pathInPublicStorage.substring(
              pathInPublicStorage.indexOf('/') + 1,
            )

            console.log('Intentando eliminar archivo en Storage:', filePathInStorage)
            const { error: deleteError } = await supabase.storage
              .from('avatars')
              .remove([filePathInStorage])

            if (deleteError) {
              console.warn(
                'Advertencia: No se pudo eliminar el archivo del Storage:',
                deleteError.message,
              )
              // No lanzamos un error fatal aquí para que la URL en la BD se pueda poner a null de todas formas.
              // El usuario al menos verá que su perfil no tiene avatar.
            }
          } catch (urlError) {
            console.warn(
              'Advertencia: oldAvatarUrl no es una URL válida para eliminar del Storage:',
              urlError.message,
            )
          }
        }

        // 2. Actualizar la URL del avatar en la tabla 'profiles' a null
        // Llama a la acción interna 'updateProfile' para manejar la actualización de la base de datos
        await this.updateProfile(profileId, { avatar_url: null })

        console.log('Avatar eliminado del perfil.')
        return true // Indica que la eliminación fue exitosa
      } catch (error) {
        this.error = error.message
        console.error('Error al eliminar avatar:', error.message)
        return false // Indica un fallo
      } finally {
        this.loading = false
      }
    },
  },
})
