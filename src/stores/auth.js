// src/stores/auth.js
import { defineStore } from 'pinia'
import { supabase } from '../supabase'
import { useToast } from 'vue-toastification'

const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // Objeto de usuario de autenticaciรณn de Supabase
    profile: null, // Datos del perfil del usuario desde la tabla 'profiles'
    loading: true, // Indica si alguna operaciรณn de autenticaciรณn estรก en curso
  }),

  actions: {
    /**
     * @description Inicializa el estado de autenticaciรณn al cargar la aplicaciรณn.
     * Intenta obtener la sesiรณn actual y carga el perfil del usuario si estรก logueado.
     */
    async initAuth() {
      console.log('initAuth: Iniciando inicializaciรณn de autenticaciรณn...')
      this.loading = true
      const toast = useToast()

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('initAuth: Error al obtener sesiรณn:', error.message)
          toast.error('Error al inicializar sesiรณn: ' + error.message)
          throw error
        }

        this.user = session?.user || null
        if (this.user) {
          console.log('initAuth: Usuario detectado, cargando perfil...')
          await this.fetchProfile() // Carga el perfil si el usuario ya estรก autenticado
        } else {
          console.log('initAuth: No hay sesion activa.')
        }

        // Suscribe a los cambios de estado de autenticaciรณn (login, logout, token refresh)
        supabase.auth.onAuthStateChange(async (event, session) => {
          console.log(`onAuthStateChange: Evento: ${event}, Sesiรณn:`, session)
          this.user = session?.user || null
          if (event === 'SIGNED_IN') {
            console.log('onAuthStateChange: Usuario logueado, recargando perfil...')
            await this.fetchProfile() // Vuelve a cargar el perfil si el estado cambia a logueado
          } else {
            console.log('onAuthStateChange: Usuario deslogueado o sin sesion.')
            this.profile = null // Limpia el perfil si el usuario se desloguea
          }
          console.log('Estado de autenticaciรณn cambiado:', this.user ? 'Logeado' : 'Deslogeado')
        })
      } catch (error) {
        console.error('initAuth: Error durante la inicializaciรณn:', error.message)
      } finally {
        this.loading = false
        console.log('initAuth: Inicializacion de autenticación finalizada. Loading:', this.loading)
      }
    },

    /**
     * @description Carga los datos del perfil del usuario autenticado desde la tabla 'profiles'.
     * Los datos se almacenan en el estado 'profile'.
     */
    async fetchProfile() {
      console.log('fetchProfile: Intentando cargar perfil para user ID:', this.user?.id)
      console.log('fetchProfile: fetchProfile function called')
      if (!this.user) {
        console.log('fetchProfile: No hay usuario autenticado, no se puede cargar el perfil.')
        this.profile = null
        return
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('nick, nombre, avatar_url, role_id, roles(name)')
          .eq('user_id', this.user.id)
          .single()

        if (error) {
          console.error('fetchProfile: Error al cargar el perfil de la BD:', error.message)
          console.error('fetchProfile: Error details:', error)
          this.profile = null
        } else {
          this.profile = data
          console.log('fetchProfile: Perfil cargado exitosamente:', this.profile)
        }
      } catch (error) {
        console.error('fetchProfile: Error general al cargar el perfil:', error.message)
        this.profile = null
      }
    },

    /**
     * @description Cierra la sesiรณn del usuario actual.
     * @returns {Promise<boolean>} True si el cierre de sesiรณn fue exitoso, false en caso contrario.
     */
    async signOut() {
      console.log('signOut: Iniciando cierre de sesiรณn...')
      this.loading = true
      try {
        const toast = useToast()
        console.log('signOut: Llamando a supabase.auth.signOut()...')
        const { error } = await supabase.auth.signOut()

        if (error) {
          console.error('signOut: Error de Supabase al cerrar sesiรณn:', error)
          toast.error('Error al cerrar sesiรณn: ' + error.message)
          return false
        }

        this.user = null // Limpia el usuario del estado
        this.profile = null // Limpia el perfil del estado
        toast.info('Sesiรณn cerrada correctamente.')
        console.log('signOut: Sesiรณn cerrada correctamente. user y profile limpiados.')
        return true
      } catch (error) {
        console.error('signOut: Error durante el cierre de sesiรณn (catch):', error.message)
        return false
      } finally {
        this.loading = false // Asegura que loading se restablece siempre
        console.log('signOut: Cierre de sesiรณn finalizado. Loading:', this.loading)
      }
    },

    /**
     * @description Registra un nuevo usuario en Supabase Auth y crea su perfil.
     * Pasa el nick, nombre, apellidos y edad como metadatos para que el trigger lo guarde.
     * @param {string} email - Email del usuario.
     * @param {string} password - Contraseรฑa del usuario.
     * @param {string} nick - Nick del usuario.
     * @param {string} [nombre] - Nombre real del usuario (opcional).
     * @param {string} apellidos - Apellidos del usuario (opcional).
     * @param {number} edad - Edad del usuario (opcional).
     * @param {File} avatarFile - Archivo del avatar (opcional).
     * @returns {Promise<boolean>} True si el registro fue exitoso, false en caso contrario.
     */
    async signUp(email, password, nick, nombre, apellidos, edad, avatarFile) {
      console.log('signUp: Iniciando registro de usuario...')
      this.loading = true
      const toast = useToast()

      try {
        console.log('signUp: Datos a enviar al registro:', { email, nick, nombre, apellidos, edad })
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              // No necesitamos pasar estos datos aquí, los guardaremos directamente en la tabla profiles
              // nick: nick,
              // nombre: nombre,
              // apellidos: apellidos,
              // edad: edad,
            },
          },
        })

        if (authError) {
          console.error('signUp: Error en Supabase Auth al registrar:', authError)
          throw authError
        }

        if (authData.user) {
          console.log('signUp: Usuario registrado en Auth:', authData.user)
          this.user = authData.user

          let profileData
          try {
            // Crear el perfil en la tabla profiles
            const { data, error } = await supabase
              .from('profiles')
              .insert([
                {
                  user_id: authData.user.id,
                  nick: nick,
                  nombre: nombre,
                  apellidos: apellidos,
                  edad: edad,
                  email: email, // Guardar el email en la tabla profiles
                },
              ])
              .select()
              .single()

            if (error) {
              console.error('signUp: Error al crear el perfil:', error)
              toast.error(`Error al crear el perfil: ${error.message}. Detalles: ${error.details}`)
              throw error
            }

            profileData = data
            console.log('signUp: Perfil creado:', profileData)
          } catch (error) {
            console.error('signUp: Error en la creación del perfil:', error)
            toast.error(
              `Error en la creación del perfil: ${error.message}. Detalles: ${error.details}`,
            )
            return false
          }

          // Subir el avatar si se proporciona un archivo
          if (avatarFile) {
            try {
              const fileExt = avatarFile.name.split('.').pop()
              const filePath = `avatars/${authData.user.id}-${Date.now()}.${fileExt}`

              const { data: avatarData, error: avatarError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, {
                  cacheControl: '3600',
                  upsert: false,
                })

              if (avatarError) {
                console.error('signUp: Error al subir el avatar:', avatarError)
                toast.error('Error al subir el avatar: ' + avatarError.message)
                // No interrumpir el registro si falla la subida del avatar
              } else {
                console.log('signUp: Avatar subido:', avatarData)
                const avatarUrl = supabase.storage.from('avatars').getPublicUrl(filePath)
                  .data.publicUrl

                // Actualizar la URL del avatar en el perfil
                const { data: updatedProfile, error: updateError } = await supabase
                  .from('profiles')
                  .update({ avatar_url: avatarUrl })
                  .eq('user_id', authData.user.id)
                  .select()
                  .single()

                if (updateError) {
                  console.error('signUp: Error al actualizar la URL del avatar:', updateError)
                  toast.error('Error al actualizar la URL del avatar: ' + updateError.message)
                  // No interrumpir el registro si falla la actualización de la URL del avatar
                } else {
                  console.log('signUp: URL del avatar actualizada:', updatedProfile)
                }
              }
            } catch (e) {
              console.error('signUp: Error al procesar el avatar:', e)
              toast.error('Error al procesar el avatar: ' + e.message)
            }
          }

          await this.fetchProfile() // Cargar el perfil recién creado
          toast.success(`ยกRegistro exitoso! Bienvenido ${nick}. Ya puedes iniciar sesión.`)
          console.log('signUp: Usuario y perfil registrados con éxito.')
          console.log('signUp: Datos del usuario registrado:', {
            email: email,
            nick: nick,
            nombre: nombre,
            apellidos: apellidos,
            edad: edad,
            avatarFile: avatarFile ? avatarFile.name : null,
          })
          return true
        } else {
          toast.info('Registro exitoso. Por favor, verifica tu email para completar el registro.')
          console.log(
            'signUp: Registro exitoso, verificación de email pendiente (authData.user es null).',
          )
          return true
        }
      } catch (error) {
        toast.error('Error al registrar: ' + error.message)
        console.error('signUp: Error durante el registro (catch):', error.message)
        return false
      } finally {
        this.loading = false
        console.log('signUp: Registro finalizado. Loading:', this.loading)
      }
    },

    /**
     * @description Inicia sesiรณn un usuario con email y contraseรฑa.
     * @param {string} email - Email del usuario.
     * @param {string} password - Contraseรฑa del usuario.
     * @returns {Promise<boolean>} True si el inicio de sesiรณn fue exitoso, false en caso contrario.
     */
    async signIn(email, password) {
      console.log('signIn: Iniciando inicio de sesiรณn...')
      this.loading = true
      const toast = useToast()

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        })

        if (error) {
          console.error('signIn: Error en Supabase Auth al iniciar sesiรณn:', error)
          throw error
        }

        console.log('signIn: Sesiรณn iniciada para usuario:', data.user)
        this.user = data.user
        await this.fetchProfile()
        toast.success('ยกSesiรณn iniciada correctamente!')
        console.log('signIn: Sesiรณn iniciada correctamente.')
        return true
      } catch (error) {
        toast.error('Error de inicio de sesiรณn: ' + error.message)
        console.error('signIn: Error durante el inicio de sesiรณn (catch):', error.message)
        return false
      } finally {
        this.loading = false
        console.log('signIn: Inicio de sesiรณn finalizado. Loading:', this.loading)
      }
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    userId: (state) => (state.user ? state.user.id : null),
    userEmail: (state) => (state.user ? state.user.email : null),
    currentUser: (state) => state.user,
    userDisplayName: (state) => {
      console.log('userDisplayName: state.profile', state.profile)
      return state.profile?.nick || state.user?.email || 'Invitado'
    },
    userRole: (state) => {
      return state.profile?.role?.name || null
    },
  },
})

// Para depuración en la consola del navegador
export { useAuthStore }
window.useAuthStore = useAuthStore
