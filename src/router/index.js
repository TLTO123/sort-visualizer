import { createRouter, createWebHistory } from "vue-router";
import OrdenarMiLista from "../views/OrdenarMiLista.vue";
import Inicio from "../views/Inicio.vue";
import Contacto from "../views/Contacto.vue";


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "Inicio",
            component: Inicio,
            meta: { title: 'Inicio' }
        },
        {
            path: "/ordenar-mi-lista",
            name: "OrdenarMiLista",
            component: OrdenarMiLista,
            meta: { title: 'Ordenar mi lista' }
        },
        {
            path: "/Contacto",
            name: "Contacto",
            component: Contacto,
            meta: {title: 'Contacto'}
        }
    ]
});

export default router;