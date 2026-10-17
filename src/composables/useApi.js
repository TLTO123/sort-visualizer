// ============================================================
// ARCHIVO: composables/useApi.js
// RESPONSABLE: patrón de carga de datos reutilizable
// QUÉ HACE: encapsula estado reactivo (datos/cargando/error) + fetch
// PATRÓN: la triada clásica de toda carga async en interfaz:
//         cargando=true → fetch → datos (éxito) | error (fallo) → cargando=false
// ============================================================

import { ref } from 'vue';
import { obtenerJSON } from '../services/api.js';

/**
 * Crea un controlador de carga para un recurso JSON.
 * @param {string} ruta - recurso en public/api/ (ej: 'algoritmos')
 * @returns {{ datos: Ref, cargando: Ref<boolean>, error: Ref<string|null>, cargar: Function }}
 */
export function useApi(ruta) {
    const datos = ref(null); // null hasta que llegue la respuesta
    const cargando = ref(false); // true mientras hay petición en vuelo
    const error = ref(null); // mensaje si algo falla (habilita el botón Reintentar)

    const cargar = async () => {
    cargando.value = true;
    error.value = null; // limpiar error de intentos anteriores
    try {
        datos.value = await obtenerJSON(ruta);
    } catch (e) {
        // Nunca se deja contenido hardcodeado como respaldo:
        // se informa el error y el usuario puede reintentar.
        error.value = e.message;
    } finally {
        cargando.value = false; // se ejecuta SIEMPRE (éxito o error)
    }
    };

    return { datos, cargando, error, cargar };
}