// src/main.js
import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { useAuthStore } from './stores/auth'
import { useProfilesStore } from './stores/profiles'
import { useSeriesStore } from './stores/series'

// Importar Vue-Toastification y su CSS
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css' // ¡Importante para los estilos por defecto del toast!

const app = createApp(App)

app.use(createPinia())

// Inicializar stores después de que Pinia esté listo
const authStore = useAuthStore()
const profilesStore = useProfilesStore()
const seriesStore = useSeriesStore()

// Configurar Toastification (puedes añadir opciones aquí para personalizar su comportamiento global)
const toastOptions = {
  // Por ejemplo, para cambiar la posición o duración:
  // position: 'top-center',
  // timeout: 3000,
  // closeOnClick: true,
  // pauseOnFocusLoss: true,
  // pauseOnHover: true,
  // draggable: true,
  // draggablePercent: 0.6,
  // showCloseButtonOnHover: false,
  // hideProgressBar: false,
  // closeButton: 'button',
  // icon: true,
  // rtl: false,
}
app.use(Toast, toastOptions) // ¡Añadir la librería a la aplicación Vue!

authStore.initAuth() // Inicializa la autenticación

// Suscribirse a cambios en el estado de autenticación para cargar el perfil
// Esto asegura que `profilesStore.myProfile` esté actualizado después de login/logout
authStore.$subscribe(async (mutation, state) => {
  if (state.user) {
    // Si hay un usuario logeado
    // Cargar o refrescar el perfil solo si no está cargado o si el user_id ha cambiado
    if (!profilesStore.myProfile || profilesStore.myProfile.user_id !== state.user.id) {
      await profilesStore.fetchMyProfile()
    }
  } else {
    // Si no hay usuario (logout)
    profilesStore.myProfile = null // Limpiar el perfil del store
  }
})

// Cargar series al inicio.
// Ya que HomePage.vue las carga en onMounted, esta línea aquí es opcional,
// pero asegura que los datos estén disponibles globalmente lo antes posible.
seriesStore.fetchSeries()

app.use(router)

app.mount('#app')
