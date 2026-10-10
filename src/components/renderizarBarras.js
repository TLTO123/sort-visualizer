// ../components/renderizarBarras.js
import * as d3 from 'd3';

// Selector de colores basado en el estado
const obtenerColor = (estado) => {
  if (estado === 'comparando') return '#FFB3BA'; // Rosa claro
  if (estado === 'minimo') return '#7DD3FC';     // Azul claro
  if (estado === 'ordenado') return '#FCE67E';   // amarillo claro para cuando ya este ordenado
  return '#4B5563'; // Gris oscuro base (default)
};


export function renderizarBarras(datos, velocidadMs = 0, selectorContenedor) {
    if (!datos || datos.length === 0) {
        console.warn("renderizarBarras: El arreglo de datos está vacío.");
        return;
    }

    const contenedor = d3.select(selectorContenedor);
    if (contenedor.empty()) {
        console.warn(`renderizarBarras: No se encontró el contenedor ${selectorContenedor}`);
        return;
    }

    const svg = contenedor.select("svg");
    if (svg.empty()) {
        console.warn(`renderizarBarras: No se encontró la etiqueta <svg> dentro de ${selectorContenedor}`);
        return;
    }

    // Forzamos dimensiones mínimas por si el CSS está colapsado
    let ancho = +svg.attr("width");
    let alto = +svg.attr("height");
    
    if (ancho <= 0) ancho = 400;
    if (alto <= 0) alto = 250;
    
    const margen = 15;

    // 1. Configurar Escala X
    const escalaX = d3.scaleBand()
        .domain(datos.map((_, i) => i))
        .range([margen, ancho - margen])
        .padding(0.2); 

    // 2. Configurar Escala Y (Aseguramos que el valor máximo sea numérico y válido)
    const valoresNumericos = datos.map(d => +d.valor);
    const valorMaximo = d3.max(valoresNumericos) || 100;

    const escalaY = d3.scaleLinear()
        .domain([0, valorMaximo])
        .range([alto - margen, margen]); 

    // 3. Vincular Datos
    const barras = svg.selectAll("rect")
        .data(datos, d => d.id);

    // --- CONTROL DE ELEMENTOS ---
    
    // ELIMINAR antiguos
    barras.exit().remove();

    // CREAR nuevos (Fuerza una posición inicial visible)
    const barrasNuevas = barras.enter()
        .append("rect")
        .attr("x", (_, i) => escalaX(i) || 0)
        .attr("y", alto - margen) 
        .attr("width", escalaX.bandwidth() || 10)
        .attr("height", 0)
        .attr("rx", 4);

    // ACTUALIZAR Y ANIMAR
    barras.merge(barrasNuevas)
        .transition()
        .duration(velocidadMs)
        .ease(d3.easeLinear) 
        .attr("x", (_, i) => escalaX(i))
        .attr("width", escalaX.bandwidth())
        .attr("y", d => escalaY(d.valor))
        // Math.max asegura que la altura de la barra nunca sea un número negativo o cero absoluto
        .attr("height", d => Math.max(2, (alto - margen) - escalaY(d.valor)))
        // Forzamos un color naranja/amarillo brillante temporal para verlas sobre tu fondo oscuro #1E1E1E
        .attr("fill",  d => obtenerColor(d.estado)); 
}