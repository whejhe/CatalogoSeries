<template>
  <div class="home-page page-card">
    <h1>Bienvenido a Tu Catálogo de Series</h1>
    <p class="tagline">Descubre, organiza y disfruta de tus series favoritas.</p>

    <p v-if="seriesStore.loading" class="loading-message">Cargando series...</p>
    <p v-if="seriesStore.error" class="error-message">{{ seriesStore.error }}</p>

    <div v-if="seriesStore.allSeries.length > 0" class="series-grid">
      <div v-for="serie in seriesStore.allSeries" :key="serie.id" class="serie-card content-card">
        <img :src="serie.portada_url" :alt="serie.titulo" class="serie-cover" />
        <div class="serie-info">
          <h2>{{ serie.titulo }}</h2>
          <p><strong>Género:</strong> {{ serie.genero }}</p>
          <p><strong>Año:</strong> {{ serie.año_lanzamiento }}</p>
          <p>{{ serie.sinopsis.substring(0, 100) }}...</p>
        </div>
      </div>
    </div>
    <p v-else-if="!seriesStore.loading">
      No hay series disponibles en el catálogo. ¡Sé el primero en añadir una!
    </p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSeriesStore } from '../stores/series'

const seriesStore = useSeriesStore()

onMounted(() => {
  if (seriesStore.allSeries.length === 0 && !seriesStore.loading) {
    seriesStore.fetchSeries()
  }
})
</script>

<style scoped lang="scss">
@use 'sass:color'; // Importa el módulo de color (aunque no se use directamente aquí, es buena práctica si la lógica SCSS es más compleja)
@use '@/assets/styles/_variables.scss' as vars; // Importa tus variables SCSS con el alias 'vars'

.home-page {
  margin-bottom: vars.$spacing-lg; // Usando variables
}

h1 {
  color: vars.$dark-text-color; // Usando variables
  text-align: center;
  margin-bottom: vars.$spacing-sm; // Usando variables
  font-size: 2.5em;
}

.tagline {
  text-align: center;
  color: vars.$medium-text-color; // Usando variables
  font-size: 1.1em;
  margin-bottom: vars.$spacing-xl; // Usando variables
}

.series-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: vars.$spacing-lg; // Usando variables
  margin-top: vars.$spacing-xl; // Usando variables
}

.serie-card {
  .serie-cover {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
  }

  .serie-info {
    padding: vars.$spacing-md; // Usando variables
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    h2 {
      font-size: 1.5em;
      color: vars.$primary-color; // Usando variables
      margin-top: 0;
      margin-bottom: vars.$spacing-sm; // Usando variables
    }

    p {
      font-size: 0.95em;
      color: vars.$medium-text-color; // Usando variables
      margin-bottom: vars.$spacing-xs; // Usando variables
      line-height: 1.4;

      strong {
        color: vars.$dark-text-color; // Usando variables
      }
    }
  }
}
</style>
