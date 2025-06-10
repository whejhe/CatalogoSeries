# 🎬 Catálogo de Series

**Proyecto Vue 3 + Supabase**

Aplicación web para gestionar un catálogo de series. Construida con **Vue 3**, **Pinia**, **Vue Router 4** y **Supabase** (autenticación y base de datos).

---

## 🚀 Funcionalidades Principales

### 1. 🔐 Autenticación con Supabase

- **Registro** de nuevos usuarios.
- **Inicio y cierre de sesión**.
- **Gestión del estado de autenticación** usando `useAuthStore` (Pinia).

### 2. 👤 Gestión de Perfiles

- Cada usuario tiene un perfil con: `nombre`, `nick`, `avatar`, `rol`.
- **Roles**: `user`, `admin`, `super_admin`.
- Uso de `useProfilesStore` para cargar y gestionar el perfil del usuario autenticado.

### 3. 🧭 Rutas y Navegación Protegida (Vue Router)

- **Rutas definidas**: `/`, `/login`, `/register`, `/manage-series`, `/admin`.
- **Guardias de navegación** (`beforeEach`):
  - `requiresAuth`: solo usuarios autenticados.
  - `requiresAdmin`: solo admins o super_admins.
  - `requiresAdminOrSuperAdmin`: ambos roles.
  - Redirección automática si se intenta acceder a `/login` o `/register` estando autenticado.

### 4. 📺 Catálogo de Series

- Uso de `useSeriesStore` para interacción con Supabase:
  - `fetchSeries()`: obtener todas.
  - `fetchSerieById()`: obtener una específica.
  - `addSerie()`, `updateSerie()`, `deleteSerie()`.
- Página principal `/` muestra todas las series.
- `/manage-series` permite agregar series (solo admin/super_admin).

### 5. 🧩 Estructura de Componentes

- **`App.vue`**: raíz con barra de navegación y `<router-view />`.
- **`TheNavbar.vue`**: muestra enlaces según autenticación y rol.
- **Vistas**:
  - `HomePage.vue`: catálogo de series.
  - `LoginPage.vue`, `RegisterPage.vue`: autenticación.
  - `ManageSeries.vue`: gestión de series.
  - `AdminPage.vue`: panel de administración (placeholder).

---

## 🛠️ Tecnologías Utilizadas

- **Vue 3**: framework principal.
- **Pinia**: gestión de estado.
- **Vue Router 4**: enrutamiento.
- **Supabase**:
  - Autenticación.
  - Base de datos PostgreSQL.
- **Vite**: bundler y servidor de desarrollo.

---

## 📂 Estructura del Proyecto

```
.
├── public/                     # Archivos estáticos
├── src/
│   ├── assets/                # Estilos y recursos
│   │   └── main.css
│   ├── components/
│   │   └── TheNavbar.vue
│   ├── stores/
│   │   ├── auth.js
│   │   ├── profiles.js
│   │   └── series.js
│   ├── router/
│   │   └── index.js
│   ├── supabase/
│   │   └── index.js
│   ├── views/
│   │   ├── AdminPage.vue
│   │   ├── HomePage.vue
│   │   ├── LoginPage.vue
│   │   ├── ManageSeries.vue
│   │   └── RegisterPage.vue
│   ├── App.vue
│   └── main.js
├── .env.example
├── package.json
└── README.md
```

---

## 🏁 Cómo Ejecutar el Proyecto

1. **Clona el repositorio** o asegúrate de tener todos los archivos del proyecto.

2. **Instala las dependencias**:

   ```bash
   npm install
   ```

3. **Configura Supabase**:

   - Crea un proyecto en [Supabase](https://supabase.io).
   - Crea las tablas `profiles`, `roles` y `series` con las estructuras necesarias.
   - Añade los roles `user`, `admin`, `super_admin` a la tabla `roles`.
   - Configura los **triggers** necesarios (ej. `handle_new_user` para crear perfiles automáticamente).
   - Copia tus claves desde Supabase.

4. **Crea el archivo `.env`** en la raíz del proyecto y añade tus credenciales:

   ```env
   VITE_SUPABASE_URL="TU_SUPABASE_URL"
   VITE_SUPABASE_ANON_KEY="TU_SUPABASE_ANON_KEY"
   ```

5. **Ejecuta el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

---

## ✅ Próximos Pasos (Ideas para Continuar)

- 🔍 **Detalle de Serie**: Página individual para ver información completa.
- ✏️ **Edición/Eliminación**: Agregar funciones para modificar o eliminar series desde la interfaz.
- 🖼️ **Subida de Imágenes**: Implementar carga directa a Supabase Storage.
- 🔎 **Búsqueda y Filtrado**: Buscar series por título, género u otros filtros.
- 📄 **Paginación**: Mejorar rendimiento al manejar grandes volúmenes.
- ⭐ **Favoritos/Listas**: Permitir que los usuarios guarden o marquen series favoritas.
- 🎨 **Mejoras UI/UX**: Aplicar mejores estilos, animaciones y experiencia general.

---
