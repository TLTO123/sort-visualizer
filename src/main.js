// ============================================================
// PUNTO DE ENTRADA DE LA APLICACIÓN
// Responsabilidades:
//   1. Montar la app de Vue con el enrutador.
//   2. Gestionar el menú lateral (offcanvas) con JS imperativo.
// ============================================================

// Importaciones principales de Vue y router
import { createApp } from 'vue';
import './style.css'; // Estilos globales
import App from './App.vue'; // Componente raíz (layout: header, main, footer y menú)
import router from './router/index.js'; // Rutas: / , /catalogo, /rendimiento, ...

// ------------------------------------------------------------
// 1) MONTAJE DE VUE
// createApp(App)  -> crea la instancia con el componente raíz
// .use(router)    -> instala Vue Router como plugin (habilita <router-link> y <RouterView>)
// .mount('#app')  -> monta todo dentro del <div id="app"> de index.html
// ------------------------------------------------------------
createApp(App).use(router).mount('#app');

// ------------------------------------------------------------
// 2) MENÚ OFFCANVAS (menú lateral deslizante)
// Se maneja con manipulación directa del DOM
//
// Funcionamiento por clases de Tailwind:
//   -translate-x-full -> el menú está FUERA de pantalla (oculto)
//    translate-x-0    -> el menú está en su posición visible
//   hidden            -> el overlay (fondo oscuro) no se muestra
// ------------------------------------------------------------

// Referencias a los elementos del DOM (App.vue debe tenerlos con esos ids)
const openMenu = document.getElementById("openMenu"); // botón hamburguesa
const closeMenu = document.getElementById("closeMenu"); // botón ✕ del menú
const overlay = document.getElementById("overlay"); // fondo semitransparente
const offcanvas = document.getElementById("offcanvas"); // panel lateral

// Desliza el menú hacia dentro de la pantalla y muestra el overlay
function openOffcanvas() {
    offcanvas.classList.remove("-translate-x-full"); // quitar estado "oculto"
    offcanvas.classList.add("translate-x-0"); // poner estado "visible"
    overlay.classList.remove("hidden"); // mostrar fondo oscuro
}

// Desliza el menú hacia fuera y oculta el overlay
function closeOffcanvas() {
    offcanvas.classList.remove("translate-x-0"); // quitar estado "visible"
    offcanvas.classList.add("-translate-x-full"); // volver a "oculto"
    overlay.classList.add("hidden"); // ocultar fondo oscuro
}

// Registro de eventos: clic en hamburguesa abre, clic en ✕ o en el fondo cierra
// (el cierre al elegir una opción del menú se registra más abajo, en la sección 3)
openMenu.addEventListener("click", openOffcanvas);
closeMenu.addEventListener("click", closeOffcanvas);
overlay.addEventListener("click", closeOffcanvas); // cerrar al hacer clic fuera del menú

// ------------------------------------------------------------
// 3) CIERRE AUTOMÁTICO AL ELEGIR UNA OPCIÓN DEL MENÚ (solo móviles)
// ------------------------------------------------------------
const consultaMovil = window.matchMedia("(max-width: 639.98px)");

offcanvas.querySelectorAll(".link").forEach((enlace) => {
  enlace.addEventListener("click", () => {
    if (consultaMovil.matches) closeOffcanvas();
  });
});