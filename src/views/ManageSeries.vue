<template>
  <div class="manage-series-page">
    <div class="manage-series-card page-card">
      <h1>Añadir Nueva Serie</h1>
      <form @submit.prevent="handleAddSerie">
        <div class="form-group">
          <label for="titulo">Título:</label>
          <input type="text" id="titulo" v-model="newSerie.titulo" required />
        </div>
        <div class="form-group">
          <label for="genero">Género:</label>
          <input type="text" id="genero" v-model="newSerie.genero" required />
        </div>
        <div class="form-group">
          <label for="año_lanzamiento">Año de Lanzamiento:</label>
          <input
            type="number"
            id="año_lanzamiento"
            v-model.number="newSerie.año_lanzamiento"
            required
          />
        </div>
        <div class="form-group">
          <label for="sinopsis">Sinopsis:</label>
          <textarea id="sinopsis" v-model="newSerie.sinopsis" required></textarea>
        </div>
        <div class="form-group">
          <label for="portada_url">URL de la Portada:</label>
          <input type="url" id="portada_url" v-model="newSerie.portada_url" required />
        </div>

        <p v-if="seriesStore.error" class="error-message">{{ seriesStore.error }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

        <button type="submit" :disabled="seriesStore.loading">
          {{ seriesStore.loading ? 'Guardando...' : 'Añadir Serie' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSeriesStore } from '../stores/series'

const seriesStore = useSeriesStore()
const successMessage = ref('')

const newSerie = ref({
  titulo: '',
  genero: '',
  año_lanzamiento: null,
  sinopsis: '',
  portada_url: '',
})

const handleAddSerie = async () => {
  successMessage.value = '' // Limpiar mensaje de éxito previo
  const success = await seriesStore.addSerie(newSerie.value)
  if (success) {
    successMessage.value = 'Serie añadida con éxito.'
    // Limpiar el formulario después de añadir
    newSerie.value = {
      titulo: '',
      genero: '',
      año_lanzamiento: null,
      sinopsis: '',
      portada_url: '',
    }
  }
}
</script>

<style scoped lang="scss">
@use 'sass:color'; // Importa el módulo de color
@use '@/assets/styles/_variables.scss' as vars; // Importa tus variables SCSS con el alias 'vars'

.manage-series-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: vars.$page-bg-color; // Usando variables
  padding: vars.$spacing-lg; // Usando variables
}

.manage-series-card {
  max-width: 600px;
  text-align: center;
  margin: 0; /* Sobreescribe el margin automático de .page-card para centrarlo manualmente aquí */
}

h1 {
  color: vars.$dark-text-color; // Usando variables
  margin-bottom: vars.$spacing-xl; // Usando variables
  font-size: 2em;
}

button[type='submit'] {
  width: 100%;
  margin-top: vars.$spacing-lg; // Usando variables
  background-color: vars.$success-color; // Usando variables

  &:hover:not(:disabled) {
    background-color: color.adjust(
      vars.$success-color,
      $lightness: -10%
    ); // Usando color.adjust y variables
  }

  &:disabled {
    background-color: color.adjust(
      vars.$success-color,
      $lightness: 20%
    ); // Usando color.adjust y variables
    cursor: not-allowed;
  }
}
</style>
