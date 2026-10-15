//Un módulo centralizado para no repetir fetch en cada vista.
export async function obtenerJSON(ruta) {
    const respuesta = await fetch(`/api/${ruta}.json`);
    if (!respuesta.ok) {
    throw new Error(
        `No se pudo cargar /api/${ruta}.json (${respuesta.status})`,
    );
    }
    return respuesta.json();
}
