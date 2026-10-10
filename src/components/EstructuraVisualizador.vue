<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
  titulo: { type: String, required: true },
  datos: { type: Array, required: true, default: () => [] }
});

const contenedorGrafico = ref(null);
let svg = null;
const configSVG = { ancho: 300, alto: 120, margen: 10 }; // Define el espacio disponible para cada barra antes de calcular su ancho y alto

// Lógica de cronómetro
const tiempoInicio = ref(0);
const tiempoActual = ref(0);
const tiempoPausadoAcumulado = ref(0);
let timerId = null;

const tiempoFormateado = computed(() => {
    const totalMs = tiempoActual.value - tiempoInicio.value;
    if (totalMs <= 0) return "00:00:00";
    
    const min = Math.floor(totalMs / 60000).toString().padStart(2, '0');
    const sec = Math.floor((totalMs % 60000) / 1000).toString().padStart(2, '0');
    const cs = Math.floor((totalMs % 1000) / 10).toString().padStart(2, '0');
    
    return `${min}:${sec}:${cs}`;
});

const iniciarCronometro = () => {
    if (!timerId) {
        tiempoInicio.value = Date.now() - tiempoPausadoAcumulado.value; // Reanuda el tiempo en caso de haber sido pausado antes, o simplemente inicia
        timerId = setInterval(() => {
            tiempoActual.value = Date.now(); // Actualiza el valor de tiempoActual cada 10mS
        }, 10);
    }
};

const detenerCronometro = () => {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        tiempoPausadoAcumulado.value = tiempoActual.value - tiempoInicio.value; // Almacena el tiempo que ha pasado desde que inicio el cronómetro
    }
};

const reiniciarCronometro = () => { // Reinicia todos los cronómetros a cero
    detenerCronometro();
    tiempoPausadoAcumulado.value = 0;
    tiempoActual.value = 0;
    tiempoInicio.value = 0;
};

// Exponemos estas funciones para que el padre (Rendimiento.vue) pueda controlarlas si es necesario
defineExpose({
  iniciarCronometro,
  detenerCronometro,
  reiniciarCronometro
});

// Renderizado D3
onMounted(() => {
  if (contenedorGrafico.value) {
    configSVG.ancho = contenedorGrafico.value.clientWidth || 300; // Obtiene el ancho del contenedor
  }
  svg = d3.select(contenedorGrafico.value) // Crea el gráfico svg de D3 en base al contenedor
    .append("svg") // Crea un elemento SVG dentro del contenedor
    .attr("width", configSVG.ancho)
    .attr("height", configSVG.alto);

  if (props.datos.length > 0) { // Si ya existen datos, renderiza las barras
    renderizarBarras(props.datos, 0);
  }
});

function renderizarBarras(arreglo, duracion = 0) {
  if (!svg) return;
  const anchoBarra = (configSVG.ancho - (configSVG.margen * 2)) / arreglo.length; // Calcula el ancho de las barras en base al espacio disponible y la cantidad de datos
  const espacio = anchoBarra > 10 ? 4 : 2; // Espacio entre barras, ajustado según el ancho de la barra
  const valorMaximo = d3.max(arreglo, d => d.valor) || 1; // Encuentra el valor máximo en el arreglo para escalar las alturas de las barras
  const escalaY = d3.scaleLinear().domain([0, valorMaximo]).range([0, configSVG.alto - 20]); // Convierte el valor de cada barra en un valor de altura

  const barras = svg.selectAll("rect.barra") // Selecciona todas las barras existentes en el SVG y las vincula con los datos del arreglo
    .data(arreglo, d => d.id); // Vincula cada barra con su identificador único para que D3 pueda manejar las actualizaciones

  barras.enter() // Maneja las barras que se están agregando
    .append("rect") // Crea un nuevo elemento rect para cada barra nueva
    .attr("class", "barra") 
    .attr("y", configSVG.alto)
    .attr("height", 0)
    .attr("rx", 4)
    .attr("ry", 4)
    .merge(barras)
    .transition().duration(duracion)
    .attr("x", (d, i) => i * anchoBarra + configSVG.margen)
    .attr("y", d => configSVG.alto - escalaY(d.valor))
    .attr("width", Math.max(anchoBarra - espacio, 2))
    .attr("height", d => escalaY(d.valor))
    .attr("fill", d => { // Cambia el color de la barra según su estado
      if (d.estado === 'comparando') return '#FFB3BA';
      if (d.estado === 'minimo') return '#7DD3FC';
      if (d.estado === 'ordenado') return '#374151';
      return '#3B82F6';
    }); // Actualiza las barras existentes con nuevas posiciones, alturas y colores

  barras.exit().remove(); // Elimina las barras que ya no están en el arreglo de datos
}

watch(() => props.datos, (nuevosDatos) => { // Observa cambios en los datos y renderiza las barras nuevamente
  if (nuevosDatos && nuevosDatos.length > 0) { 
    renderizarBarras(nuevosDatos, 0);
  }
}, { deep: true }); 
</script>

<template>
  <article class="tarjeta-algoritmo">
    <h3>{{ titulo }}</h3>
    <figure ref="contenedorGrafico" class="grafico w-full flex items-center justify-center"></figure>
    <time class="cronometro">{{ tiempoFormateado }}</time>
  </article>
</template>

<style scoped>
.tarjeta-algoritmo {
    background-color: #272727;
    border: 1px solid #333333;
    border-radius: 12px;
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.tarjeta-algoritmo h3 { 
    font-size: 1rem; 
    margin-bottom: 1rem; 
    color: #FFFFFF; 
}

.grafico { 
    width: 100%; 
    height: 120px; 
    border-bottom: 1px solid #555; 
    margin: 0 0 1.5rem 0; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
}

.cronometro { 
    background-color: #FCE67E; 
    color: #000000; 
    padding: 0.4rem 1.2rem; 
    border-radius: 10px; 
    font-family: monospace; 
    font-size: 1rem; 
    font-weight: bold; 
}
</style>