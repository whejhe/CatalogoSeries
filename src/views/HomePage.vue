<template>
  <div class="home-page page-card">
    <h1>Bienvenido a Tu Catálogo de Series</h1>
    <p class="tagline">Descubre, organiza y disfruta de tus series favoritas.</p>

    <p v-if="seriesStore.loading" class="loading-message">Cargando series...</p>
    <p v-if="seriesStore.error" class="error-message">{{ seriesStore.error }}</p>

    <div v-if="seriesStore.allSeries.length > 0" class="series-grid">
      <router-link
        v-for="serie in seriesStore.allSeries"
        :key="serie.id"
        :to="{ name: 'series-detail', params: { id: serie.id } }"
        class="serie-card content-card"
      >
        <img :src="serie.portada_url" :alt="serie.titulo" class="serie-cover" />
        <div class="serie-info">
          <h2>{{ serie.titulo }}</h2>
          <p><strong>Género:</strong> {{ serie.genero }}</p>
          <p><strong>Año:</strong> {{ serie.año_lanzamiento }}</p>
          <p>{{ serie.sinopsis.substring(0, 100) }}...</p>
        </div>
      </router-link>
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
@use 'sass:color';
@use '@/assets/styles/_variables.scss' as vars;

.home-page {
  margin-bottom: vars.$spacing-lg;
}

h1 {
  color: vars.$dark-text-color;
  text-align: center;
  margin-bottom: vars.$spacing-sm;
  font-size: 2.5em;
}

.tagline {
  text-align: center;
  color: vars.$medium-text-color;
  font-size: 1.1em;
  margin-bottom: vars.$spacing-xl;
}

.series-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: vars.$spacing-lg;
  margin-top: vars.$spacing-xl;
}

.serie-card {
  text-decoration: none; // Eliminar el subrayado del router-link
  color: inherit; // Heredar color del texto del padre
  // ... (tus estilos existentes para .serie-card y sus hijos)
  .serie-cover {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
  }

  .serie-info {
    padding: vars.$spacing-md;
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    h2 {
      font-size: 1.5em;
      color: vars.$primary-color;
      margin-top: 0;
      margin-bottom: vars.$spacing-sm;
    }

    p {
      font-size: 0.95em;
      color: vars.$medium-text-color;
      margin-bottom: vars.$spacing-xs;
      line-height: 1.4;

      strong {
        color: vars.$dark-text-color;
      }
    }
  }
}
</style>
