import { createRouter, createWebHistory } from "vue-router";
import OrdenarMiLista from "../views/OrdenarMiLista.vue";
import Inicio from "../views/Inicio.vue";

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
        }
    ]
});

export default router;