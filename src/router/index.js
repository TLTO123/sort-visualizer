import { createRouter, createWebHistory } from "vue-router";
import OrdenarMiLista from "../views/OrdenarMiLista.vue";
import Inicio from "../views/Inicio.vue";
import Rendimiento from "../views/Rendimiento.vue";
import Contacto from "../views/Contacto.vue";
import Catalogo from "../views/Catalogo.vue";
import Desarrolladores from "../views/Desarrolladores.vue";


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
            path: "/catalogo",
            name: "Catalogo",
            component: Catalogo,
            meta: { title: "Catálogo" }
        },
        {
            path: "/ordenar-mi-lista",
            name: "OrdenarMiLista",
            component: OrdenarMiLista,
            meta: { title: 'Ordenar mi lista' }
        },
        {
            path: "/rendimiento",
            name: "Rendimiento",
            component: Rendimiento,
            meta: { title: 'Rendimiento' }
        },
        {
            path: "/desarrolladores",
            name: "Desarrolladores",
            component: Desarrolladores,
            meta: { title: "Desarrolladores" }
        },
        {
            path: "/contacto",
            name: "Contacto",
            component: Contacto,
            meta: {title: 'Contacto'}
        }
    ]
});

export default router;