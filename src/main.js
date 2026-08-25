import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js';

createApp(App).use(router).mount('#app');

const openMenu = document.getElementById("openMenu");
const closeMenu = document.getElementById("closeMenu");
const overlay = document.getElementById("overlay");

const offcanvas = document.getElementById("offcanvas");


function openOffcanvas() {

    offcanvas.classList.remove("-translate-x-full");
    offcanvas.classList.add("translate-x-0");

    overlay.classList.remove("hidden");

}

function closeOffcanvas() {

    offcanvas.classList.remove("translate-x-0");
    offcanvas.classList.add("-translate-x-full");

    overlay.classList.add("hidden");

}

openMenu.addEventListener("click", openOffcanvas);
closeMenu.addEventListener("click", closeOffcanvas);
overlay.addEventListener("click", closeOffcanvas);
