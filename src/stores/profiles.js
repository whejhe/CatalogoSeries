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
     * Obtiene todos los perfiles de usuario junto con su rol.
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
            role:role_id(name)
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
     * Obtiene el perfil del usuario actualmente logeado.
     * Esto asume que el usuario ya está autenticado.
     */
    async fetchMyProfile() {
      this.loading = true
      this.error = null
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser() // Obtiene la información del usuario autenticado
        if (!user) {
          this.error = 'No hay usuario autenticado.'
          this.myProfile = null // Asegura que myProfile sea null si no hay usuario
          return null
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
            role:role_id(name)
          `,
          )
          .eq('user_id', user.id) // Filtramos por el user_id del usuario autenticado
          .single() // Esperamos solo un resultado

        if (error) throw error

        // Combina el perfil de la BBDD con el email del usuario de auth.users
        this.myProfile = { ...data, email: user.email }
        console.log('Mi perfil cargado:', this.myProfile)
        return this.myProfile
      } catch (error) {
        this.error = error.message
        console.error('Error al cargar mi perfil:', error.message)
        this.myProfile = null
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * Actualiza un perfil existente (ej. nombre, nick, etc.).
     * @param {object} profileData - Objeto con los datos a actualizar.
     */
    async updateProfile(profileData) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', profileData.id) // Asegúrate de pasar el ID del perfil a actualizar
          .select()
          .single()

        if (error) throw error

        this.myProfile = data // Actualiza el perfil en el store si la actualización fue del propio usuario
        console.log('Perfil actualizado:', data)
        return true
      } catch (error) {
        this.error = error.message
        console.error('Error al actualizar el perfil:', error.message)
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * Asigna un rol a un perfil de usuario.
     * Normalmente esto solo debería ser accesible por administradores.
     * @param {string} profileId - El ID del perfil a modificar.
     * @param {string} roleName - El nombre del rol a asignar (ej. 'admin', 'user').
     */
    async assignRoleToProfile(profileId, roleName) {
      this.loading = true
      this.error = null
      try {
        // Primero, obtenemos el ID del rol a partir de su nombre
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', roleName)
          .single()

        if (roleError) throw roleError
        if (!roleData) throw new Error(`Rol '${roleName}' no encontrado.`)

        const roleId = roleData.id

        // Luego, actualizamos el role_id del perfil
        const { data, error } = await supabase
          .from('profiles')
          .update({ role_id: roleId })
          .eq('id', profileId)
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
                    role:role_id(name)
                `,
          ) // Selecciona el perfil actualizado con el nombre del rol
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
  },
})
