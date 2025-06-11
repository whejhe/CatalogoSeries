<template>
  <div class="admin-page page-card">
    <h1>Panel de Administración</h1>
    <p>¡Bienvenido al panel de administración!</p>
    <p>Aquí podrás gestionar usuarios, roles, y otras configuraciones de la aplicación.</p>
    <p>
      Esta página aún está en desarrollo y se irá llenando con funcionalidades específicas para
      administradores.
    </p>
  </div>
</template>

<script setup>
// Por ahora, no necesita lógica de script específica.
// Si añades funcionalidades de administración, aquí iría tu código.
</script>

<style scoped lang="scss">
@use 'sass:color'; // Importa el módulo de color (aunque no se use directamente aquí)
@use '@/assets/styles/_variables.scss' as vars; // Importa tus variables SCSS con el alias 'vars'

.admin-page {
  margin-bottom: vars.$spacing-lg; // Usando variables
}

h1 {
  color: vars.$dark-text-color; // Usando variables
  margin-bottom: vars.$spacing-md; // Usando variables
  font-size: 2em;
}

p {
  color: vars.$medium-text-color; // Usando variables
  font-size: 1.1em;
  line-height: 1.5;
  margin-bottom: vars.$spacing-sm; // Usando variables
}
</style>
