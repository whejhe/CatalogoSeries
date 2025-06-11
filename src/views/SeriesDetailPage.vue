<template>
  <div class="series-detail-page page-card">
    <p v-if="loading" class="loading-message">Cargando detalles de la serie...</p>
    <p v-if="error" class="error-message">{{ error }}</p>

    <div v-if="series" class="series-content">
      <div class="series-header">
        <img :src="series.portada_url" :alt="series.titulo" class="series-cover-large" />
        <div class="series-info">
          <h1>{{ series.titulo }}</h1>
          <p><strong>Género:</strong> {{ series.genero }}</p>
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
        <button v-if="canEditSeries" @click="editSeries" class="edit-button">Editar Serie</button>
        <button @click="router.push('/')" class="back-button">Volver al Catálogo</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSeriesStore } from '../stores/series'
import { useProfilesStore } from '../stores/profiles' // Importa el store de perfiles

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const seriesStore = useSeriesStore()
const profilesStore = useProfilesStore() // Inicializa el store de perfiles
const route = useRoute()
const router = useRouter()

const series = ref(null)
const loading = ref(true)
const error = ref(null)

/**
 * @description Propiedad computada para verificar si el usuario actual puede editar series.
 * Solo administradores y superadministradores tienen este permiso.
 */
const canEditSeries = computed(() => {
  // Asegurarse de que el perfil esté cargado y que el rol sea 'admin' o 'super_admin'
  const userRole = profilesStore.myProfile?.role?.name
  return userRole === 'admin' || userRole === 'super_admin'
})

/**
 * @description Extrae el ID de un video de YouTube de una URL dada.
 * @param {string} url - La URL del video de YouTube.
 * @returns {string|null} El ID del video de YouTube o null si no se encuentra.
 */
const getYouTubeVideoId = (url) => {
  if (!url) return null
  let videoId = null
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(youtubeRegex)
  if (match && match[1]) {
    videoId = match[1]
  }
  return videoId
}

// Propiedad computada para generar la URL de incrustación de YouTube
const youtubeEmbedUrl = computed(() => {
  if (series.value && series.value.trailer_url) {
    const videoId = getYouTubeVideoId(series.value.trailer_url)
    // Formato de URL para incrustar videos de YouTube
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }
  return null
})

/**
 * @description Carga los detalles de una serie específica desde el store.
 * @param {string} serieId - El ID de la serie a cargar.
 */
const fetchSeriesDetails = async (serieId) => {
  loading.value = true
  error.value = null
  try {
    const fetchedSeries = await seriesStore.fetchSerieById(serieId)
    if (fetchedSeries) {
      series.value = fetchedSeries
    } else {
      error.value = 'Serie no encontrada.'
      series.value = null
    }
  } catch (err) {
    error.value = 'Error al cargar los detalles de la serie: ' + err.message
    series.value = null
    console.error(err)
  } finally {
    loading.value = false
  }
}

/**
 * @description Navega a la página de edición de la serie actual.
 */
const editSeries = () => {
  if (series.value && series.value.id) {
    // Navegamos a la ruta 'manage-series' con el ID de la serie
    router.push({ name: 'manage-series', params: { id: series.value.id } })
  }
}

onMounted(() => {
  // Asegurarse de que el perfil esté cargado si no lo está.
  // Esto es importante para que 'canEditSeries' tenga el rol correcto.
  if (profilesStore.isAuthenticated && !profilesStore.myProfile && !profilesStore.loading) {
    profilesStore.fetchMyProfile()
  }

  if (props.id) {
    fetchSeriesDetails(props.id)
  } else {
    error.value = 'No se proporcionó ID de serie en la ruta.'
    loading.value = false
  }
})

// Opcional: Re-cargar si el ID de la ruta cambia (si el usuario navega entre detalles de series)
watch(
  () => props.id,
  (newId) => {
    if (newId) {
      fetchSeriesDetails(newId)
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
@use 'sass:color';
@use '@/assets/styles/_variables.scss' as vars;

.series-detail-page {
  padding: vars.$spacing-xl;
  max-width: 900px;
  width: 100%;
  margin: vars.$spacing-lg auto;
  text-align: left;
}

.series-content {
  display: flex;
  flex-direction: column;
  gap: vars.$spacing-xl;
}

.series-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: vars.$spacing-lg;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
}

.series-cover-large {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: vars.$border-radius-md;
  box-shadow: vars.$box-shadow-medium;
  flex-shrink: 0;
}

.series-info {
  flex-grow: 1;
  h1 {
    color: vars.$primary-color;
    font-size: 2.5em;
    margin-top: 0;
    margin-bottom: vars.$spacing-md;
    text-align: center;
    @media (min-width: 768px) {
      text-align: left;
    }
  }

  p {
    color: vars.$medium-text-color;
    margin-bottom: vars.$spacing-sm;
    font-size: 1.1em;

    strong {
      color: vars.$dark-text-color;
    }
  }

  .series-sinopsis {
    font-size: 1em;
    line-height: 1.6;
    margin-top: vars.$spacing-md;
    color: vars.$dark-text-color;
  }
}

.series-trailer {
  margin-top: vars.$spacing-xl;
  h2 {
    color: vars.$dark-text-color;
    font-size: 2em;
    margin-bottom: vars.$spacing-lg;
    text-align: center;
  }
}

.video-responsive {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  max-width: 100%;
  background: #000;
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

  &:hover {
    background-color: color.adjust(vars.$secondary-color, $lightness: -10%);
  }
}

.edit-button {
  background-color: vars.$primary-color; // Color principal para el botón de edición
  color: vars.$light-text-color;
  border: none;

  &:hover {
    background-color: color.adjust(vars.$primary-color, $lightness: -10%);
  }
}
</style>
