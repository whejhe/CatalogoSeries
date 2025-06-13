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

- **Rutas definidas**: `/`, `/login`, `/register`, `/manage-series`, `/admin`, `/series/:id`.
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
- `/manage-series` permite agregar/editar series (solo admin/super_admin).
- `/series/:id` muestra los detalles de una serie específica.

### 5. 🏷️ Gestión de Géneros (Normalizada)

- Los géneros de las series se gestionan de forma normalizada a través de una tabla `genres` y una tabla de unión `serie_genres`. Esto permite que una serie pueda tener múltiples géneros de manera eficiente y escalable.

### 6. 🧩 Estructura de Componentes

- **`App.vue`**: raíz con barra de navegación y `<router-view />`.
- **`TheNavbar.vue`**: muestra enlaces según autenticación y rol.
- **Vistas**:
    - `HomePage.vue`: catálogo de series.
    - `LoginPage.vue`, `RegisterPage.vue`: autenticación.
    - `ManageSeries.vue`: gestión de series (añadir/editar).
    - `SeriesDetailPage.vue`: detalles de una serie.
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

---

.
├── public/ # Archivos estáticos
├── src/
│ ├── assets/ # Estilos y recursos
│ │ └── main.css
│ ├── components/
│ │ └── TheNavbar.vue
│ ├── stores/
│ │ ├── auth.js
│ │ ├── profiles.js
│ │ └── series.js
│ ├── router/
│ │ └── index.js
│ ├── supabase,js
│ │
│ ├── views/
│ │ ├── AdminPage.vue
│ │ ├── HomePage.vue
│ │ ├── LoginPage.vue
│ │ ├── ManageSeries.vue
│ │ └── RegisterPage.vue
│ ├── App.vue
│ └── main.js
├── .env.example
├── package.json
└── README.md

````

---

## 🏁 Cómo Ejecutar el Proyecto

1. **Clona el repositorio** o asegúrate de tener todos los archivos del proyecto.

2. **Instala las dependencias**:

   ```bash
   npm install
````

3. **Configura Supabase**:

   - Crea un proyecto en [Supabase](https://supabase.io).
   - **Aplica el esquema SQL proporcionado**, que incluye:
     - Tablas: `profiles`, `roles`, `series`, `genres`, `serie_genres`, `user_lists`, `list_series`, `series_ratings`, `user_series_progress`, `comments`.
     - Roles iniciales: `user`, `admin`, `super_admin`, `guest`.
     - Funciones y triggers: `handle_new_user()` (crea perfil y lista 'Favoritos' al registrarse), `update_updated_at_column()` (para timestamps automáticos), `update_series_average_rating()` (calcula rating medio de series).

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

## 🎨 Gestión de Estilos (Sass)

La aplicación utiliza Sass para una gestión de estilos robusta y mantenible. Se han implementado las siguientes mejoras recientes para modernizar y optimizar el uso de Sass:

- **Migración a `@use`**: Se ha actualizado la forma de importar estilos y variables en todos los componentes y archivos `.scss`, pasando de la regla `@import` a la más moderna y eficiente `@use`. Esto asegura una mejor modularidad, evita conflictos de nombres y resuelve advertencias de depreciación en Dart Sass 3.0.0.
- **Configuración de Vite**: Se ha eliminado la inyección global de variables Sass a través de `additionalData` en `vite.config.js`. Ahora, cada archivo o componente Vue que necesite acceder a las variables o funciones de Sass lo hace explícitamente mediante `@use`.
- **Módulo de Color de Sass**: Para la manipulación de colores, se ha introducido el uso explícito del módulo `sass:color` con `@use "sass:color";`. Esto permite el acceso a funciones avanzadas como `color.adjust()`.
- **Actualización de Funciones de Color**: Las funciones `darken()` y `lighten()`, que estaban deprecadas, han sido reemplazadas por `color.adjust()` para ajustar la luminosidad de los colores de forma segura y compatible con las últimas versiones de Sass.
- **Variables de Estilo**: Se ha añadido la variable `$disabled-bg-color` a `src/assets/styles/_variables.scss` para proporcionar un color de fondo consistente y semántico para los elementos deshabilitados en toda la aplicación.

---

## 📦 Dependencias y Configuración Adicional

El archivo `package.json` lista varias dependencias de desarrollo relacionadas con la calidad del código y el formato:

- **ESLint**: Configurado para linting de código JavaScript y Vue. El archivo de configuración principal es `eslint.config.js`.
- **Prettier**: Utilizado para formatear automáticamente el código. La configuración se encuentra en `.prettierrc.json`.
- Los scripts `npm run lint` y `npm run format` están definidos para ejecutar estas herramientas.

## ⚙️ Inicialización y Configuración (Detalles del Código)

- **Inicialización de Stores**: El archivo `src/main.js` muestra la secuencia específica de inicialización de las stores de Pinia (`auth`, `profiles`, `series`) después de que Pinia se ha montado en la aplicación.
- **Suscripción de Autenticación**: En `src/main.js`, hay una suscripción al estado de la store `auth` (`authStore.$subscribe`). Esta suscripción se encarga de llamar a `profilesStore.fetchMyProfile()` automáticamente cuando el usuario se logea (`state.user` existe) y de limpiar `profilesStore.myProfile` cuando el usuario cierra sesión (`state.user` es nulo). Esto asegura que el perfil del usuario autenticado esté siempre sincronizado con el estado de autenticación.
- **Carga de Variables de Entorno**: El archivo `src/supabase.js` demuestra cómo se accede a las variables de entorno de Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) utilizando `import.meta.env`, que es el método recomendado por Vite. También incluye una verificación básica para asegurar que estas variables estén definidas.

## 📄 index.html

- El título de la página en `index.html` es el valor por defecto de Vite: `<title>Vite App</title>`. Este podría ser actualizado a un título más descriptivo del proyecto, como "Catálogo de Series".

---

## ✅ Próximos Pasos (Ideas para Continuar)

- 🖼️ **Subida de Imágenes**: Implementar carga directa a Supabase Storage para las portadas.
- 🔎 **Búsqueda y Filtrado**: Buscar series por título, género u otros filtros.
- 📄 **Paginación**: Mejorar rendimiento al manejar grandes volúmenes de series.
- ⭐ **Favoritos/Listas Adicionales**: Permitir que los usuarios gestionen sus series en listas personalizadas.
- 🎨 **Mejoras UI/UX**: Aplicar mejores estilos, animaciones y mejorar la experiencia general del usuario.
- 💬 **Funcionalidad de Comentarios**: Integrar la posibilidad de que los usuarios dejen comentarios en las series.
- 📊 **Seguimiento de Progreso**: Permitir a los usuarios marcar episodios vistos y seguir su progreso en las series.
