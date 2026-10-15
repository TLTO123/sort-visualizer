import { obtenerJSON } from "./api.js";

const TTL = 60 * 60 * 1000; // 1 hora de caché

export async function obtenerPerfilGitHub(usuario) {
  const clave = `gh:${usuario}`;
  const guardado = sessionStorage.getItem(clave);

  if (guardado) {
    const { fecha, perfil } = JSON.parse(guardado);
    if (Date.now() - fecha < TTL) return perfil; // sin petición a la red
  }

  const respuesta = await fetch(`https://api.github.com/users/${usuario}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!respuesta.ok) {
    if (respuesta.status === 404) throw new Error("usuario-no-encontrado");
    if (respuesta.status === 403) throw new Error("limite-superado");
    throw new Error(`GitHub ${respuesta.status}`);
  }

  const perfil = await respuesta.json();
  sessionStorage.setItem(clave, JSON.stringify({ fecha: Date.now(), perfil }));
  return perfil;
}

export async function obtenerEquipoCompleto() {
  const equipo = await obtenerJSON("equipo");

  return Promise.all(
    equipo.map(async (miembro) => {
      try {
        const gh = await obtenerPerfilGitHub(miembro.github);
        return {
          ...miembro, // datos de TU json
          avatar: gh.avatar_url + "?s=200", // datos de GITHUB
          bio: gh.bio || `${miembro.rol} en SortVisualizer`,
          perfil: gh.html_url,
          repos: gh.public_repos,
          seguidores: gh.followers,
          ubicacion: gh.location || "—",
        };
      } catch (e) {
        // Degradación elegante: si GitHub falla, la tarjeta sigue existiendo
        return {
          ...miembro,
          avatar: null, // → la vista muestra iniciales
          bio:
            e.message === "usuario-no-encontrado"
              ? "Usuario de GitHub no configurado"
              : "Perfil no disponible por ahora",
          perfil: null,
          repos: null,
          seguidores: null,
          ubicacion: "—",
        };
      }
    }),
  );
}