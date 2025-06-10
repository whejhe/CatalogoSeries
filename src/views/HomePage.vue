<template>
  <div class="home-page">
    <h1>Bienvenido a Tu Catálogo de Series</h1>
    <p class="tagline">Descubre, organiza y disfruta de tus series favoritas.</p>

    <p v-if="seriesStore.loading" class="loading-message">Cargando series...</p>
    <p v-if="seriesStore.error" class="error-message">{{ seriesStore.error }}</p>

    <div v-if="seriesStore.allSeries.length > 0" class="series-grid">
      <div v-for="serie in seriesStore.allSeries" :key="serie.id" class="serie-card">
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
import { useSeriesStore } from '../stores/series' // Asegúrate de la ruta correcta

const seriesStore = useSeriesStore()

// Cargamos las series al montar el componente si aún no están cargadas
onMounted(() => {
  if (seriesStore.allSeries.length === 0 && !seriesStore.loading) {
    seriesStore.fetchSeries()
  }
})
</script>

<style scoped>
/* Estos estilos son los mismos que en SeriesList.vue, podrías considerar moverlos a un archivo CSS común */
/* Por ahora, los he duplicado para que funcione directamente */
.home-page {
  padding: 20px;
  max-width: 1200px;
  margin: 20px auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 10px;
  font-size: 2.5em;
}

.tagline {
  text-align: center;
  color: #666;
  font-size: 1.1em;
  margin-bottom: 30px;
}

.loading-message,
.error-message {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
}

.error-message {
  color: #dc3545;
}

.series-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.serie-card {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.serie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.serie-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.serie-info {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.serie-info h2 {
  font-size: 1.5em;
  color: #0056b3;
  margin-top: 0;
  margin-bottom: 10px;
}

.serie-info p {
  font-size: 0.95em;
  color: #666;
  margin-bottom: 5px;
  line-height: 1.4;
}

.serie-info p strong {
  color: #333;
}
</style>
