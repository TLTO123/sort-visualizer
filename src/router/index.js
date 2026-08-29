import { createRouter, createWebHistory } from "vue-router";
import Rendimiento from "../views/Rendimiento.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/Rendimiento",
            name: "Rendimiento",
            component: Rendimiento,
            meta: { title: 'Rendimiento' }
        }
    ]
});

export default router;