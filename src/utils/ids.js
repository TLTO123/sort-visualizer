// ============================================================
// ARCHIVO: utils/ids.js
// RESPONSABLE: generación de identificadores únicos para D3
// POR QUÉ EXISTE: crypto.randomUUID() solo existe en contextos
//   "seguros" (https:// o localhost). Al probar la app desde un
//   móvil con http://192.168.1.x:5173 la API devolvía undefined y
//   la vista crasheaba al montar → las barras nunca se dibujaban
//   (solo en móvil, no en PC).
// QUÉ HACE: expone generarId(), que intenta randomUUID() y si no
//   está disponible cae a un UUID v4 construido con
//   crypto.getRandomValues() (sí disponible en HTTP).
// ============================================================

/**
 * Devuelve un id único (UUID v4 si es posible).
 * Útil como clave estable para D3: svg.selectAll("rect.barra").data(datos, d => d.id)
 */
export function generarId() {
  // Contexto seguro → el camino rápido y estándar.
  if (typeof crypto?.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback A: getRandomValues() existe también en contextos no
  // seguros, así que construimos un UUID v4 manualmente.
  if (typeof crypto?.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    bytes[6] = (bytes[6] & 0x0f) | 0x40; // versión 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante RFC 4122

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
    return [
      hex.slice(0, 4).join(''),
      hex.slice(4, 6).join(''),
      hex.slice(6, 8).join(''),
      hex.slice(8, 10).join(''),
      hex.slice(10, 16).join(''),
    ].join('-');
  }

  // Fallback B (navegadores muy antiguos): timestamp + aleatorio.
  // Basta para que D3 distinga elementos entre sí.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
