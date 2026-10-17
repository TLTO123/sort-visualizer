// ============================================================
// ARCHIVO: components/renderizarBarras.js
// RESPONSABLE: motor de dibujo compartido (D3 + SVG)
// QUÉ HACE: dibuja/anima un arreglo de {id, valor, estado} como barras
// USADO POR: Rendimiento.vue (4 gráficas en paralelo) y OrdenarMiLista.vue (1 sola)
// CONCEPTOS: escalas D3, data join con clave estable (id), patrón enter/exit/merge
// ============================================================

import * as d3 from "d3";

const obtenerColor = (estado) => {
  if (estado === "comparando") return "#FFB3BA";
  if (estado === "minimo") return "#7DD3FC";
  if (estado === "ordenado") return "#FCE67E";
  return "#4B5563";
};

/**
 * Dibuja (o redibuja) las barras del arreglo dentro del SVG del contenedor.
 * @param {Array<{id:string, valor:number, estado:string}>} datos - foto del arreglo
 * @param {number} velocidadMs - duración de la transición (0 = dibujar al instante)
 * @param {string|Element} selectorContenedor - selector CSS o elemento DOM del contenedor
 *   (Rendimiento.vue pasa el string '#grafico-...', OrdenarMiLista.vue pasa el elemento ref)
 * @param {boolean} rendimiento - si es true dibuja el valor numérico encima de cada barra
 *   (solo OrdenarMiLista.vue lo pasa en true; Rendimiento.vue no lo usa)
 */
export function renderizarBarras(
  datos,
  velocidadMs = 0,
  selectorContenedor,
  rendimiento,
) {
  const contenedor = d3.select(selectorContenedor);

  if (contenedor.empty()) {
    console.warn(`No se encontró el contenedor: ${selectorContenedor}`);
    return;
  }

  const nodoContenedor = contenedor.node();
  const svg = contenedor.select("svg");

  if (svg.empty()) {
    console.warn(`No se encontró el SVG: ${selectorContenedor}`);
    return;
  }

  if (!datos || datos.length === 0) {
    svg.selectAll("*").interrupt();
    svg.selectAll("rect.barra, text.etiqueta").remove();
    return;
  }

  // Usar el ancho real del contenedor, no el ancho de la ventana.
  const anchoReal = nodoContenedor.clientWidth;
  const anchoAnterior = Number(svg.attr("width")) || 400;
  const ancho = anchoReal > 0 ? anchoReal : anchoAnterior;
  const alto = Number(svg.attr("height")) || 250;

  if (ancho <= 0 || alto <= 0) return;

  // Sincronizar las dimensiones internas del SVG.
  svg
    .attr("width", ancho)
    .attr("height", alto)
    .attr("viewBox", `0 0 ${ancho} ${alto}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .style("display", "block")
    .style("width", "100%")
    .style("max-width", "100%");

  // Reducir los márgenes en pantallas estrechas.
  const margenX = Math.min(25, ancho * 0.05);
  const margenY = Math.min(25, alto * 0.1);
  const base = alto - margenY;

  const escalaX = d3
    .scaleBand()
    .domain(datos.map((_, i) => i))
    .range([margenX, Math.max(margenX, ancho - margenX)])
    .padding(0.2);

  const valoresNumericos = datos.map((d) => {
    const valor = Number(d.valor);
    return Number.isFinite(valor) ? valor : 0;
  });

  const valorMaximo = d3.max(valoresNumericos) || 100;

  const escalaY = d3
    .scaleLinear()
    .domain([0, valorMaximo])
    .range([base, margenY]);

  // Interrumpir transiciones antiguas antes de recalcular posiciones.
  svg.selectAll("*").interrupt();

  const barras = svg.selectAll("rect.barra").data(datos, (d) => d.id);

  barras.exit().remove();

  const barrasNuevas = barras
    .enter()
    .append("rect")
    .attr("class", "barra")
    .attr("x", (_, i) => escalaX(i) ?? margenX)
    .attr("y", base)
    .attr("width", escalaX.bandwidth())
    .attr("height", 0)
    .attr("rx", Math.min(4, escalaX.bandwidth() / 2));

  const todasLasBarras = barras.merge(barrasNuevas);

  const actualizarBarras = (seleccion) =>
    seleccion
      .attr("x", (_, i) => escalaX(i) ?? margenX)
      .attr("width", escalaX.bandwidth())
      .attr("y", (d) => escalaY(Number(d.valor) || 0))
      .attr("height", (d) => Math.max(0, base - escalaY(Number(d.valor) || 0)))
      .attr("fill", (d) => obtenerColor(d.estado));

  if (velocidadMs > 0) {
    actualizarBarras(
      todasLasBarras.transition().duration(velocidadMs).ease(d3.easeLinear),
    );
  } else {
    actualizarBarras(todasLasBarras);
  }

  // Etiquetas numéricas sobre las barras: solo se dibujan si el que llama
  // pasa rendimiento=true (hoy solo lo hace OrdenarMiLista.vue, Rendimiento.vue no)
  const textos = svg.selectAll("text.etiqueta");

  if (!rendimiento) {
    textos.remove();
    return;
  }

  const etiquetas = textos.data(datos, (d) => d.id);
  etiquetas.exit().remove();

  const etiquetasNuevas = etiquetas
    .enter()
    .append("text")
    .attr("class", "etiqueta text-white lexend font-bold text-sm")
    .attr("text-anchor", "middle")
    .attr("fill", "#FFFFFF");

  const todasLasEtiquetas = etiquetas.merge(etiquetasNuevas);
  const anchoBarra = escalaX.bandwidth();

  const actualizarEtiquetas = (seleccion) =>
    seleccion
      .text((d) => d.valor)
      .style("opacity", anchoBarra < 25 ? 0 : 1)
      .attr("font-size", anchoBarra < 35 ? "10px" : "14px")
      .attr("x", (_, i) => (escalaX(i) ?? margenX) + anchoBarra / 2)
      .attr("y", (d) => escalaY(Number(d.valor) || 0) - 8);

  if (velocidadMs > 0) {
    actualizarEtiquetas(
      todasLasEtiquetas.transition().duration(velocidadMs).ease(d3.easeLinear),
    );
  } else {
    actualizarEtiquetas(todasLasEtiquetas);
  }
}
