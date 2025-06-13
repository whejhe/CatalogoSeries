<template>
  <div class="home-page page-card">
    <h1>Bienvenido a Tu Catálogo de Series</h1>
    <p class="tagline">Descubre, organiza y disfruta de tus series favoritas.</p>

    <p v-if="seriesStore.loading" class="loading-message">Cargando series...</p>
    <p v-if="seriesStore.error" class="error-message">
      Error al cargar series: {{ seriesStore.error }}
    </p>

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
          <p><strong>Año:</strong> {{ serie.año_lanzamiento }}</p>
          <p class="series-sinopsis-preview">{{ serie.sinopsis.substring(0, 100) }}...</p>
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
  display: flex;
  flex-direction: column;
  border: 1px solid vars.$light-border-color;
  border-radius: vars.$border-radius-lg;
  overflow: hidden;
  box-shadow: vars.$box-shadow-small;
  transition:
    transform vars.$transition-speed ease-in-out,
    box-shadow vars.$transition-speed ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: vars.$box-shadow-medium;
  }

  .serie-cover {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
    border-bottom: 1px solid vars.$light-border-color;
  }

  .serie-info {
    padding: vars.$spacing-md;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  h2 {
    font-size: 1.4em;
    color: vars.$dark-text-color;
    margin-top: 0;
    margin-bottom: vars.$spacing-xs;
  }

  p {
    color: vars.$medium-text-color;
    font-size: 0.95em;
    margin-bottom: vars.$spacing-xs;
  }

  .series-sinopsis-preview {
    font-size: 0.9em;
    color: vars.$light-text-color;
    flex-grow: 1; /* Permite que la sinopsis ocupe el espacio restante */
    margin-top: vars.$spacing-sm;
    line-height: 1.4;
  }
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
</style>
