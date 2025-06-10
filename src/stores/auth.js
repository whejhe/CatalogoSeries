// src/stores/auth.js
import { defineStore } from 'pinia'
import { supabase } from '../supabase' // Asegúrate de que esta ruta sea correcta

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // Almacenará la información del usuario autenticado de Supabase
    loading: true, // Indica si el estado de autenticación inicial está siendo cargado
    authError: null, // Almacenará errores relacionados con la autenticación
  }),

  actions: {
    /**
     * @description Inicializa el estado de autenticación al cargar la aplicación.
     * Escucha cambios en el estado de autenticación de Supabase.
     */
    async initAuth() {
      this.loading = true
      try {
        // Obtenemos la sesión actual de Supabase.
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) throw error

        // Si hay una sesión, establecemos el usuario.
        this.user = session?.user || null

        // Escuchamos los cambios en el estado de autenticación (login, logout, etc.)
        supabase.auth.onAuthStateChange((_, session) => {
          this.user = session?.user || null
          console.log('Estado de autenticación cambiado:', this.user ? 'Logeado' : 'Deslogeado')
        })
      } catch (error) {
        this.authError = error.message
        console.error('Error al inicializar la autenticación:', error.message)
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Registra un nuevo usuario con email y contraseña.
     * @param {string} email - El correo electrónico del usuario.
     * @param {string} password - La contraseña del usuario.
     */
    async signUp(email, password) {
      this.loading = true
      this.authError = null
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          // Puedes añadir opciones para la redirección de confirmación de email si usas esa función
          // options: {
          //   emailRedirectTo: 'http://localhost:5173/confirm-email'
          // }
        })

        if (error) throw error

        // Supabase automáticamente creará el perfil gracias al trigger `handle_new_user`
        // Si no se crea el perfil automáticamente (ej. si el trigger no se ejecutó o hay problemas),
        // aquí es donde normalmente harías una inserción manual en 'profiles'
        // pero con el trigger, esto no es necesario.
        this.user = data.user
        console.log('Usuario registrado con éxito:', data.user)
        return true // Indicamos éxito
      } catch (error) {
        this.authError = error.message
        console.error('Error durante el registro:', error.message)
        return false // Indicamos fallo
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Inicia sesión de un usuario con email y contraseña.
     * @param {string} email - El correo electrónico del usuario.
     * @param {string} password - La contraseña del usuario.
     */
    async signIn(email, password) {
      this.loading = true
      this.authError = null
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        })

        if (error) throw error

        this.user = data.user
        console.log('Usuario ha iniciado sesión:', data.user)
        return true // Indicamos éxito
      } catch (error) {
        this.authError = error.message
        console.error('Error durante el inicio de sesión:', error.message)
        return false // Indicamos fallo
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Cierra la sesión del usuario actual.
     */
    async signOut() {
      this.loading = true
      this.authError = null
      try {
        const { error } = await supabase.auth.signOut()

        if (error) throw error

        this.user = null // Limpiamos el usuario del store
        console.log('Sesión cerrada correctamente.')
        return true // Indicamos éxito
      } catch (error) {
        this.authError = error.message
        console.error('Error durante el cierre de sesión:', error.message)
        return false // Indicamos fallo
      } finally {
        this.loading = false
      }
    },
  },

  getters: {
    /**
     * @returns {boolean} True si hay un usuario autenticado, false en caso contrario.
     */
    isAuthenticated: (state) => !!state.user,
    /**
     * @returns {string|null} El ID del usuario autenticado.
     */
    userId: (state) => (state.user ? state.user.id : null),
    /**
     * @returns {string|null} El email del usuario autenticado.
     */
    userEmail: (state) => (state.user ? state.user.email : null),
    /**
     * @returns {object|null} El objeto de usuario de Supabase.
     */
    currentUser: (state) => state.user,
  },
})
