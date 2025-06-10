<template>
  <div id="app-container">
    <TheNavbar />
    <main class="app-main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import TheNavbar from './components/TheNavbar.vue' // Importa el componente de navegación
// No necesitas importar stores aquí a menos que App.vue los use directamente.
// Los componentes hijos y los guards de navegación ya se encargarán de usarlos.
</script>

<style>
/* Estilos globales para el cuerpo de la aplicación */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f0f2f5; /* Un color de fondo suave para toda la app */
  color: #333;
}

#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Asegura que el contenedor ocupe al menos toda la altura de la ventana */
}

.app-main-content {
  flex-grow: 1; /* Permite que el contenido principal ocupe el espacio restante */
  /* Puedes añadir padding o max-width aquí si quieres que todo el contenido
     tenga un espaciado consistente desde los bordes de la pantalla. */
}
</style>
