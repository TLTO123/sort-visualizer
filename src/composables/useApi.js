import { ref } from 'vue';
import { obtenerJSON } from '../services/api.js';

// Un composable es una función reutilizable que encapsula lógica reactiva (patrón de Vue 3 Composition API).
export function useApi(ruta) {
    const datos = ref(null);
    const cargando = ref(false);
    const error = ref(null);

    const cargar = async () => {
    cargando.value = true;
    error.value = null;
    try {
        datos.value = await obtenerJSON(ruta);
    } catch (e) {
        error.value = e.message;
    } finally {
        cargando.value = false;
    }
    };

    return { datos, cargando, error, cargar };
}