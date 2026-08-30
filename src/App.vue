<script setup>
import { RouterView } from 'vue-router';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

// Creamos la instancia para acceder a las propiedades de la ruta actual (ej. path, meta)
const route = useRoute();

// Declaramos la variable reactiva 'pageTitle' con el valor por defecto 'Inicio'
const pageTitle = ref('Inicio');

// Configuramos un observador (watcher) sobre la propiedad 'meta.title' de la ruta activa
watch(
  () => route.meta.title, // Función evaluadora (getter): extrae la propiedad a vigilar
  (newTitle) => {        // Callback: se ejecuta cada vez que 'route.meta.title' cambia
    if (newTitle) {      // Comprobamos que la ruta activa tenga un título definido en su 'meta'
      pageTitle.value = newTitle; // Asignamos el nuevo título a nuestra variable reactiva
    }
  },
  { immediate: true } // Opción para ejecutar la función inmediatamente al cargar el componente
);

</script>

<template>
  <header class="bg-[#141414] sticky top-0 z-50">
    <div class="flex flex-row border-b-4 border-b-[#9D9D9D] p-3">
      <div class="basis-1/16 flex justify-center">
        <button class="hover:cursor-pointer" type="button" id="openMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="yellow"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
      </div>
      <div class="basis-14/16 flex p-2 justify-center">
          <h1 class="text-white lexend text-title">Sort Visualizer</h1>
      </div>
    </div>
    <div class="flex flex-row bg-[#193264] p-2 justify-center">
      <h2 class="text-white lexend text-subtitle">{{ pageTitle }}</h2>
    </div>
  </header>
  <main>
    <RouterView />
  </main>

  <footer class="bg-black p-4 fixed bottom-0 min-w-full">
    <p class="text-white text-center mono text-body">© 2026 SortVisualizer. Todos los derechos reservados.</p>
  </footer>

  <!-- Overlay -->
  <div id="overlay" class="fixed inset-0 z-40 hidden bg-black/50"></div>
  
  <!--Contenido dentro del offcanvas-->
  <div class="fixed bottom-0 left-0 top-0 z-1045 flex w-96 max-w-full -translate-x-full flex-col border-none bg-[#141414] bg-clip-padding text-white shadow-sm outline-none transition duration-300 ease-in-out data-twe-offcanvas-show:transform-none" tabindex="-1" id="offcanvas" aria-labelledby="offcanvasLabel" data-twe-offcanvas-init>
    <div class="flex items-center justify-between p-4 mt-5">
      <h2 class="text-subtitle ml-2 mt-2 lexend font-bold">
            Menú
      </h2>
      <button id="closeMenu" type="button" class="rounded-sm py-1 px-2 text-title text-gray-500 hover:bg-red-500 hover:text-white hover:cursor-pointer">
            ✕
      </button>
    </div>
    <nav class="p-4 mt-10">
      <ul class="space-y-2">
        <li>
          <router-link class="link block text-body lexend rounded-lg px-4 py-3 hover:bg-yellow-500" to="/">Inicio</router-link>
        </li>
        <li>
          <router-link class="link block text-body lexend rounded-lg px-4 py-3 hover:bg-yellow-500" to="/">Catálogo</router-link>
        </li>
        <li>
          <router-link class="link block text-body lexend rounded-lg px-4 py-3 hover:bg-yellow-500" to="/rendimiento">Rendimiento</router-link>
        </li>
        <li>
          <router-link class="link block text-body lexend rounded-lg px-4 py-3 hover:bg-yellow-500" to="/ordenar-mi-lista">Ordenar mi lista</router-link>
        </li>
        <li>
          <router-link class="link block text-body lexend rounded-lg px-4 py-3 hover:bg-yellow-500" to="/">Desarrolladores</router-link>
        </li>
        <li>
          <router-link class="link block text-body lexend rounded-lg px-4 py-3 hover:bg-yellow-500" to="/">Contacto</router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style>
</style>
