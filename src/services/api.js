// ============================================================
// ARCHIVO: services/api.js
// RESPONSABLE: acceso a los JSON locales servidos por Vite
// QUÉ HACE: pide /api/{ruta}.json por HTTP (fetch) y devuelve JSON
// NOTAS: centralizar el fetch aquí permite cambiar la fuente de
// datos sin tocar las vistas (principio DRY).
// ============================================================

/**
 * Descarga un archivo JSON desde public/api/.
 * @param {string} ruta - nombre del archivo SIN extensión ('algoritmos', 'equipo'...)
 * @returns {Promise<any>} el contenido parseado
 * @throws {Error} si la respuesta no es 2xx (ej: 404 si el archivo no existe)
 */

export async function obtenerJSON(ruta) {
    // Los archivos viven en public/api/, solo así el contenido es verdaderamente dinámico (fetch) 
    // y no queda incrustado en el bundle.
    const respuesta = await fetch(`/api/${ruta}.json`);
    if (!respuesta.ok) {
        // Se lanza error; quien llama (useApi) lo captura con try/catch
        throw new Error(
            `No se pudo cargar /api/${ruta}.json (${respuesta.status})`,
        );
    }
    return respuesta.json();
}