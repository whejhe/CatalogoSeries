<template>
  <div class="manage-series-page">
    <div class="manage-series-card page-card">
      <h1>{{ isEditing ? 'Editar Serie' : 'Añadir Nueva Serie' }}</h1>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="titulo">Título:</label>
          <input type="text" id="titulo" v-model="formData.titulo" required />
        </div>
        <div class="form-group">
          <label for="genero">Género:</label>
          <input type="text" id="genero" v-model="formData.genero" required />
        </div>
        <div class="form-group">
          <label for="año_lanzamiento">Año de Lanzamiento:</label>
          <input
            type="number"
            id="año_lanzamiento"
            v-model.number="formData.año_lanzamiento"
            required
          />
        </div>
        <div class="form-group">
          <label for="sinopsis">Sinopsis:</label>
          <textarea id="sinopsis" v-model="formData.sinopsis" required></textarea>
        </div>
        <div class="form-group">
          <label for="portada_url">URL de la Portada:</label>
          <input type="url" id="portada_url" v-model="formData.portada_url" required />
        </div>
        <div class="form-group">
          <label for="trailer_url">URL del Trailer (YouTube):</label>
          <input
            type="url"
            id="trailer_url"
            v-model="formData.trailer_url"
            placeholder="Ej: https://www.youtube.com/watch?v=..."
          />
        </div>

        <p v-if="seriesStore.error" class="error-message">{{ seriesStore.error }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

        <button type="submit" :disabled="seriesStore.loading">
          {{
            seriesStore.loading
              ? isEditing
                ? 'Guardando...'
                : 'Añadiendo...'
              : isEditing
                ? 'Guardar Cambios'
                : 'Añadir Serie'
          }}
        </button>

        <button
          v-if="isEditing"
          @click="router.push({ name: 'series-detail', params: { id: props.id } })"
          type="button"
          class="cancel-button"
        >
          Cancelar y Volver
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router' // Importa useRouter
import { useSeriesStore } from '../stores/series'

// Define las props que el componente puede recibir. 'id' será el ID de la serie si estamos editando.
const props = defineProps({
  id: {
    type: String,
    default: undefined, // Por defecto undefined, indicando que no hay ID para editar
  },
})

const seriesStore = useSeriesStore()
const router = useRouter() // Instancia del router para la navegación programática

const successMessage = ref('') // Mensaje de éxito después de una operación
const formData = ref({
  // Objeto reactivo para los datos del formulario
  titulo: '',
  genero: '',
  año_lanzamiento: null,
  sinopsis: '',
  portada_url: '',
  trailer_url: '',
})

// Propiedad computada para determinar si estamos en modo edición (si la prop 'id' tiene un valor)
const isEditing = computed(() => !!props.id)

/**
 * @description Carga los datos de la serie si estamos en modo edición.
 * Si no estamos editando, reinicia el formulario.
 */
const loadSerieForEditing = async () => {
  successMessage.value = '' // Limpiar mensaje de éxito previo
  seriesStore.error = null // Limpiar errores del store

  if (isEditing.value) {
    // Si la prop 'id' tiene un valor, estamos en modo edición.
    const serieToEdit = await seriesStore.fetchSerieById(props.id)
    if (serieToEdit) {
      // Si la serie se encuentra, rellenar el formulario con sus datos
      formData.value = { ...serieToEdit }
    } else {
      // Si la serie no se encuentra (ej. ID inválido), mostrar error y redirigir
      seriesStore.error = 'Serie no encontrada para edición.'
      // Opcional: Podrías redirigir a una página de error o al catálogo principal
      // router.replace({ name: 'home' });
    }
  } else {
    // Si no hay 'id' en las props, estamos en modo "añadir nueva serie".
    // Reiniciar el formulario a sus valores por defecto.
    formData.value = {
      titulo: '',
      genero: '',
      año_lanzamiento: null,
      sinopsis: '',
      portada_url: '',
      trailer_url: '',
    }
  }
}

/**
 * @description Maneja el envío del formulario. Llama a la acción de añadir o actualizar del store
 * dependiendo de si estamos en modo edición o no.
 */
const handleSubmit = async () => {
  successMessage.value = '' // Limpiar mensajes de éxito
  seriesStore.error = null // Limpiar errores del store
  let success = false

  if (isEditing.value) {
    // Si estamos editando, llamar a la acción updateSerie del store
    success = await seriesStore.updateSerie(props.id, formData.value)
    if (success) {
      successMessage.value = 'Serie actualizada con éxito.'
      // Después de guardar, redirigir a la página de detalle de la serie actualizada
      setTimeout(() => {
        router.push({ name: 'series-detail', params: { id: props.id } })
      }, 1000) // Pequeño retraso para que el usuario vea el mensaje de éxito
    }
  } else {
    // Si estamos añadiendo, llamar a la acción addSerie del store
    success = await seriesStore.addSerie(formData.value)
    if (success) {
      successMessage.value = 'Serie añadida con éxito.'
      // Limpiar el formulario después de añadir para una nueva entrada
      formData.value = {
        titulo: '',
        genero: '',
        año_lanzamiento: null,
        sinopsis: '',
        portada_url: '',
        trailer_url: '',
      }
    }
  }
}

// Hook de ciclo de vida: al montar el componente, cargar los datos (si es edición)
onMounted(loadSerieForEditing)

// Observador: si la prop 'id' cambia (ej. al navegar entre diferentes series en modo edición),
// recargar los datos del formulario.
watch(
  () => props.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      loadSerieForEditing()
    }
  },
)
</script>

<style scoped lang="scss">
@use 'sass:color';
@use '@/assets/styles/_variables.scss' as vars;

.manage-series-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: vars.$page-bg-color;
  padding: vars.$spacing-lg;
  min-height: calc(100vh - 60px); // Ajusta según la altura de tu navbar
}

.manage-series-card {
  max-width: 600px;
  text-align: center;
  margin: 0;
  width: 100%; // Asegura que la tarjeta ocupe el ancho disponible hasta max-width
}

h1 {
  color: vars.$dark-text-color;
  margin-bottom: vars.$spacing-xl;
  font-size: 2em;
}

form {
  display: flex;
  flex-direction: column;
  gap: vars.$spacing-md; // Espacio entre grupos de formulario
}

.form-group {
  text-align: left;
  label {
    display: block;
    margin-bottom: vars.$spacing-xs;
    color: vars.$dark-text-color;
    font-weight: bold;
  }
  input[type='text'],
  input[type='number'],
  input[type='url'],
  textarea {
    width: 100%;
    padding: vars.$spacing-sm;
    border: 1px solid vars.$border-color;
    border-radius: vars.$border-radius-sm;
    box-sizing: border-box; /* Incluir padding en el ancho */
    font-size: 1em;
    color: vars.$dark-text-color;
    background-color: vars.$input-bg-color; // Color de fondo para inputs

    &:focus {
      outline: none;
      border-color: vars.$primary-color;
      box-shadow: 0 0 0 2px rgba(vars.$primary-color, 0.2);
    }
  }
  textarea {
    min-height: 100px;
    resize: vertical; // Permite redimensionar verticalmente
  }
}

button[type='submit'] {
  width: 100%;
  margin-top: vars.$spacing-lg;
  background-color: vars.$primary-color; // Color principal para el botón de acción
  color: vars.$light-text-color;
  border: none;
  border-radius: vars.$border-radius-sm;
  padding: vars.$spacing-sm vars.$spacing-md;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color vars.$transition-speed vars.$transition-ease;

  &:hover:not(:disabled) {
    background-color: color.adjust(vars.$primary-color, $lightness: -10%);
  }

  &:disabled {
    background-color: vars.$disabled-bg-color; // Color de fondo deshabilitado
    cursor: not-allowed;
    color: color.adjust(vars.$medium-text-color, $lightness: 20%);
  }
}

.cancel-button {
  width: 100%;
  margin-top: vars.$spacing-md;
  background-color: vars.$secondary-color;
  color: vars.$light-text-color;
  border: none;
  border-radius: vars.$border-radius-sm;
  padding: vars.$spacing-sm vars.$spacing-md;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color vars.$transition-speed vars.$transition-ease;

  &:hover:not(:disabled) {
    background-color: color.adjust(vars.$secondary-color, $lightness: -10%);
  }
}

.error-message {
  color: vars.$danger-color;
  margin-top: vars.$spacing-sm;
}

.success-message {
  color: vars.$success-color;
  margin-top: vars.$spacing-sm;
}
</style>
