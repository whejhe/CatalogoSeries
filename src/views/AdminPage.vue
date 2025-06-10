<template>
  <div class="admin-page">
    <h1>Página de Administración</h1>
    <p>Aquí podrás gestionar las series del catálogo.</p>
  </div>
</template>

<script setup>
// Por ahora, no necesitamos lógica compleja aquí
</script>

<style scoped>
.admin-page {
  text-align: center;
  padding: 50px 20px;
  background-color: #f0f0f0;
  min-height: calc(100vh - 100px); /* Ajusta si tienes header/footer */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h1 {
  color: #0056b3;
  margin-bottom: 20px;
}

p {
  color: #555;
  font-size: 1.1em;
}
</style>
