<template>
  <div class="manage-series-page">
    <div class="manage-series-card">
      <h1>Añadir Nueva Serie</h1>
      <form @submit.prevent="handleAddSerie">
        <div class="form-group">
          <label for="titulo">Título:</label>
          <input type="text" id="titulo" v-model="serieForm.titulo" required />
        </div>
        <div class="form-group">
          <label for="sinopsis">Sinopsis:</label>
          <textarea id="sinopsis" v-model="serieForm.sinopsis" rows="5" required></textarea>
        </div>
        <div class="form-group">
          <label for="portada_url">URL de la Portada:</label>
          <input type="url" id="portada_url" v-model="serieForm.portada_url" required />
        </div>
        <div class="form-group">
          <label for="genero">Género:</label>
          <input type="text" id="genero" v-model="serieForm.genero" required />
        </div>
        <div class="form-group">
          <label for="año_lanzamiento">Año de Lanzamiento:</label>
          <input
            type="number"
            id="año_lanzamiento"
            v-model.number="serieForm.año_lanzamiento"
            required
            min="1900"
            :max="currentYear"
          />
        </div>

        <button type="submit" :disabled="seriesStore.loading">
          {{ seriesStore.loading ? 'Guardando...' : 'Añadir Serie' }}
        </button>

        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="seriesStore.error" class="error-message">{{ seriesStore.error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useSeriesStore } from '../stores/series' // Asegúrate de la ruta correcta

const seriesStore = useSeriesStore()

// Estado reactivo para el formulario de la serie
const serieForm = reactive({
  titulo: '',
  sinopsis: '',
  portada_url: '',
  genero: '',
  año_lanzamiento: new Date().getFullYear(), // Año actual por defecto
})

const successMessage = ref('')

// Propiedad computada para el año máximo del input number
const currentYear = computed(() => new Date().getFullYear())

/**
 * @description Maneja el envío del formulario para añadir una nueva serie.
 */
const handleAddSerie = async () => {
  successMessage.value = '' // Limpiar mensajes
  seriesStore.error = null

  // Pequeña validación extra para la URL de la portada si no es de tipo URL
  if (
    !serieForm.portada_url.startsWith('http://') &&
    !serieForm.portada_url.startsWith('https://')
  ) {
    seriesStore.error =
      'La URL de la portada debe ser una URL válida (ej. empezar con http:// o https://).'
    return
  }

  // Llamar a la acción del store para añadir la serie
  const success = await seriesStore.addSerie(serieForm)

  if (success) {
    successMessage.value = '¡Serie añadida con éxito!'
    // Opcional: Limpiar el formulario después del éxito
    serieForm.titulo = ''
    serieForm.sinopsis = ''
    serieForm.portada_url = ''
    serieForm.genero = ''
    serieForm.año_lanzamiento = new Date().getFullYear()
    // Re-cargar las series en la página de inicio para que la nueva aparezca
    seriesStore.fetchSeries()
  }
  // Si no hay éxito, el error ya se habrá establecido en seriesStore.error
}
</script>

<style scoped>
.manage-series-page {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Alinea arriba si el contenido es corto */
  min-height: calc(100vh - 60px);
  background-color: #f0f2f5;
  padding: 20px;
}

.manage-series-card {
  background-color: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  font-size: 2em;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: calc(100% - 20px);
  padding: 12px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical; /* Permite redimensionar verticalmente */
  min-height: 80px;
}

button[type='submit'] {
  width: 100%;
  padding: 15px;
  background-color: #28a745; /* Color verde para añadir */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 20px;
}

button[type='submit']:hover:not(:disabled) {
  background-color: #218838;
}

button[type='submit']:disabled {
  background-color: #8acb9e;
  cursor: not-allowed;
}

.success-message {
  color: #28a745;
  margin-top: 15px;
  font-size: 0.9em;
}

.error-message {
  color: #dc3545;
  margin-top: 15px;
  font-size: 0.9em;
}
</style>
