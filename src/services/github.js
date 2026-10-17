// ============================================================
// ARCHIVO: services/github.js
// RESPONSABLE: integración con la API REST pública de GitHub
// QUÉ HACE: descarga perfiles de usuario y los FUSIONA con equipo.json
// RIESGO CONOCIDO: sin token, GitHub permite 60 peticiones/hora por IP;
//                  por eso existe la caché con TTL de 1 hora.
// DEPENDENCIAS: services/api.js (para leer equipo.json)
// ============================================================
import { obtenerJSON } from "./api.js";

const TTL = 60 * 60 * 1000; // Time To Live - 1 hora (milisegundos): vida útil de la caché antes de volver a consultar

/**
 * Obtiene el perfil público de un usuario de GitHub.
 * Estrategia: caché en sessionStorage → si es válida, 0 peticiones a la red.
 * @param {string} usuario - login de GitHub (ej: "torvalds")
 * @returns {Promise<Object>} perfil completo (avatar_url, bio, html_url...)
 * @throws {Error} mensaje tipado: "usuario-no-encontrado" (404) | "limite-superado" (403)
 *   o "GitHub <status>" para cualquier otro error
 */

export async function obtenerPerfilGitHub(usuario) {
  const clave = `gh:${usuario}`;
  const guardado = sessionStorage.getItem(clave);

  if (guardado) {
    const { fecha, perfil } = JSON.parse(guardado);
    if (Date.now() - fecha < TTL) return perfil; // caché vigente: respuesta sin red
  }
  // API REST de GitHub: habilita CORS, por eso el navegador puede llamarla directo.
  const respuesta = await fetch(`https://api.github.com/users/${usuario}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!respuesta.ok) {
    // Errores tipados: la vista decide qué mostrar en cada caso
    if (respuesta.status === 404) throw new Error("usuario-no-encontrado");
    if (respuesta.status === 403) throw new Error("limite-superado");
    throw new Error(`GitHub ${respuesta.status}`);
  }

  const perfil = await respuesta.json();
  sessionStorage.setItem(clave, JSON.stringify({ fecha: Date.now(), perfil }));
  return perfil;
}

/**
 * Combina el JSON (equipo.json) con la API de GitHub: 1 petición local
 * + N peticiones a GitHub lanzadas EN PARALELO con Promise.all.
 * @returns {Promise<Array>} equipo enriquecido: { ...miembro, avatar }
 *   (solo se agrega el avatar; el resto de campos viene del JSON local)
 */

export async function obtenerEquipoCompleto() {
  const equipo = await obtenerJSON("equipo"); // fuente 1: JSON local

  return Promise.all( // fuente 2: GitHub, en paralelo
    equipo.map(async (miembro) => {
      try {
        const gh = await obtenerPerfilGitHub(miembro.github);
        return {
          ...miembro, // campos del JSON local
          avatar: gh.avatar_url + "?s=200", // único campo que se agrega desde GitHub
        };
      } catch (e) {
        // Si GitHub falla, la tarjeta sigue existiendo
        return {
          ...miembro,
          avatar: null, // la vista muestra iniciales
        };
      }
    }),
  );
}