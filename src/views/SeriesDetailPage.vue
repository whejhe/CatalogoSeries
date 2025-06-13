<template>
  <div class="series-detail-page page-card">
    <p v-if="loading" class="loading-message">Cargando detalles de la serie...</p>
    <p v-if="error" class="error-message">Error: {{ error }}</p>

    <div v-if="series" class="series-content">
      <div class="series-header">
        <img :src="series.portada_url" :alt="series.titulo" class="series-cover-large" />
        <div class="series-info">
          <h1>{{ series.titulo }}</h1>
          <p><strong>Año de Lanzamiento:</strong> {{ series.año_lanzamiento }}</p>
          <p class="series-sinopsis">{{ series.sinopsis }}</p>
        </div>
      </div>

      <div v-if="youtubeEmbedUrl" class="series-trailer">
        <h2>Trailer</h2>
        <div class="video-responsive">
          <iframe
            :src="youtubeEmbedUrl"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>
      <p v-else-if="series.trailer_url" class="no-trailer-message">
        No se pudo cargar el trailer o el formato de URL no es válido.
      </p>
      <p v-else class="no-trailer-message">No hay trailer disponible para esta serie.</p>

      <div class="action-buttons">
        <button @click="goBack" class="back-button">Volver al Catálogo</button>
        <button
          v-if="
            authStore.isAuthenticated &&
            (profilesStore.myProfile?.role?.name === 'admin' ||
              profilesStore.myProfile?.role?.name === 'super_admin')
          "
          @click="editSerie"
          class="edit-button"
        >
          Editar Serie
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSeriesStore } from '../stores/series'
import { useAuthStore } from '../stores/auth' // Necesario para verificar si está autenticado
import { useProfilesStore } from '../stores/profiles' // Necesario para verificar el rol

const route = useRoute()
const router = useRouter()
const seriesStore = useSeriesStore()
const authStore = useAuthStore()
const profilesStore = useProfilesStore()

const series = ref(null)
const loading = ref(true)
const error = ref(null)

// Propiedad computada para generar la URL de incrustación de YouTube
const youtubeEmbedUrl = computed(() => {
  if (series.value?.trailer_url) {
    const url = series.value.trailer_url
    // Expresión regular para extraer el ID de video de varias URLs de YouTube
    const regExp =
      /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/
    const match = url.match(regExp)
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`
    }
  }
  return null
})

/**
 * @description Carga los detalles de la serie por su ID.
 * @param {string} id - El ID de la serie.
 */
const fetchSerieDetails = async (id) => {
  loading.value = true
  error.value = null
  try {
    const fetchedSeries = await seriesStore.fetchSerieById(id)
    if (fetchedSeries) {
      series.value = fetchedSeries
    } else {
      error.value = 'Serie no encontrada.'
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Observa el ID de la ruta para recargar los detalles de la serie si cambia
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchSerieDetails(newId)
    }
  },
  { immediate: true }, // Carga los detalles de la serie inmediatamente al montar
)

/**
 * @description Navega de regreso a la página principal.
 */
const goBack = () => {
  router.push('/')
}

/**
 * @description Navega a la página de edición de la serie actual.
 */
const editSerie = () => {
  if (series.value?.id) {
    router.push({ name: 'manage-series', params: { id: series.value.id } })
  }
}
</script>

<style scoped lang="scss">
@use 'sass:color';
@use '@/assets/styles/_variables.scss' as vars;

.series-detail-page {
  max-width: 900px;
  margin: vars.$spacing-lg auto;
  padding: vars.$spacing-xl;
  background-color: vars.$light-background-color;
  border-radius: vars.$border-radius-lg;
  box-shadow: vars.$box-shadow-medium;
}

.loading-message,
.error-message {
  text-align: center;
  margin-top: vars.$spacing-lg;
  font-weight: bold;
}

.error-message {
  color: vars.$danger-color;
}

.series-content {
  display: flex;
  flex-direction: column;
  gap: vars.$spacing-xl;
}

.series-header {
  display: flex;
  flex-direction: column; /* Cambiado a columna para móviles, luego a fila */
  align-items: center;
  gap: vars.$spacing-xl;

  @media (min-width: 768px) {
    flex-direction: row; /* En pantallas más grandes, volver a fila */
    align-items: flex-start;
  }
}

.series-cover-large {
  width: 100%;
  max-width: 300px; /* Ancho máximo para la portada */
  height: auto;
  border-radius: vars.$border-radius-md;
  box-shadow: vars.$box-shadow-medium;
  object-fit: cover;
}

.series-info {
  flex-grow: 1;
  text-align: center; /* Centrar texto en móvil */

  @media (min-width: 768px) {
    text-align: left; /* Alinear a la izquierda en pantallas grandes */
  }

  h1 {
    font-size: 2.5em;
    color: vars.$primary-color;
    margin-bottom: vars.$spacing-md;
  }

  p {
    font-size: 1.1em;
    color: vars.$dark-text-color;
    margin-bottom: vars.$spacing-sm;
  }

  .series-sinopsis {
    margin-top: vars.$spacing-md;
    font-size: 1em;
    line-height: 1.6;
    color: vars.$medium-text-color;
  }
}

.series-trailer {
  margin-top: vars.$spacing-xl;

  h2 {
    font-size: 1.8em;
    color: vars.$dark-text-color;
    margin-bottom: vars.$spacing-md;
    text-align: center;
  }
}

.video-responsive {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  overflow: hidden;
  border-radius: vars.$border-radius-md;
  box-shadow: vars.$box-shadow-medium;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
}

.no-trailer-message {
  text-align: center;
  color: vars.$medium-text-color;
  font-style: italic;
  margin-top: vars.$spacing-md;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap; // Permite que los botones se envuelvan en pantallas pequeñas
  justify-content: center; // Centra los botones
  gap: vars.$spacing-md; // Espacio entre botones
  margin-top: vars.$spacing-xl;
}

.back-button,
.edit-button {
  width: fit-content; // Ajusta el ancho al contenido
  padding: vars.$spacing-sm vars.$spacing-md;
  border-radius: vars.$border-radius-sm;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color vars.$transition-speed vars.$transition-ease;
  white-space: nowrap; // Evita que el texto del botón se rompa

  &:hover:not(:disabled) {
    filter: brightness(0.9); // Efecto de oscurecimiento al pasar el ratón
  }
}

.back-button {
  background-color: vars.$secondary-color;
  color: vars.$light-text-color;
  border: none;
}

.edit-button {
  background-color: vars.$primary-color;
  color: vars.$light-text-color;
  border: none;
}
</style>
