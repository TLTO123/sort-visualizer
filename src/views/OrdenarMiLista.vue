<script setup>
// ============================================================
// ARCHIVO: views/OrdenarMiLista.vue
// RESPONSABLE: el USUARIO escribe la lista
//   y elige UN algoritmo; se visualiza paso a paso con cronómetro.
// CONCEPTOS CLAVE:
//   - Misma arquitectura de generadores/reproductor que Rendimiento.vue,
//     pero con UN solo "hilo" (sin diccionarios por selector).
//   - El usuario puede editar la lista en caliente: el watch(valoresInput)
//     cancela la ejecución y redibuja la previsualización al instante.
//   - D3 recibe los datos completos en cada paso y anima la diferencia
//     vía data join con clave estable (id).
// ============================================================

import { ref, onMounted, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import * as d3 from 'd3';
import { renderizarBarras } from '../components/renderizarBarras.js';
import { bubbleSortGenerador } from '../algorithms/generadores.js';
import { selectionSortGenerador } from '../algorithms/generadores.js';
import { insertionSortGenerador } from '../algorithms/generadores.js';
import { quickSortGenerador } from '../algorithms/generadores.js';
import { generarId } from '../utils/ids.js'; // Id con fallback: funciona también en http por IP (móvil)


// Referencias de la interfaz
const valoresInput = ref("26, 87, 30, 19, 63, 83, 27, 88, 81, 26, 79, 75, 76, 84, 36");
const algoritmoSeleccionado = ref("bubble");
const velocidadSlider = ref(50);
const estaPausado = ref(false);
const estaEjecutando = ref(false); // Explícito: ¿hay un generador vivo ahora mismo?
const contenedorGrafico = ref(null);

// Variables de estado
let datos = [];
let algoritmoPausado = null;
let temporizadorAnimacion = null;
let svg = null;

// Lógica del Cronómetro
const tiempoInicio = ref(0);
const tiempoActual = ref(0);
const tiempoPausadoAcumulado = ref(0);
let timerId = null;

const tiempoFormateado = computed(() => {
  const totalMs = tiempoActual.value - tiempoInicio.value;
  if (totalMs <= 0) return "00:00:00";

  const min = Math.floor(totalMs / 60000).toString().padStart(2, '0');
  const sec = Math.floor((totalMs % 60000) / 1000).toString().padStart(2, '0');
  const cs = Math.floor((totalMs % 1000) / 10).toString().padStart(2, '0'); // Centésimas

  return `${min}:${sec}:${cs}`;
});

// medidas base del SVG: el margen ya no se usa porque renderizarBarras.js
// calcula los suyos propios según el tamaño de la pantalla
const configSVG = { ancho: 800, alto: 450, margen: 15 };
const velocidadMs = computed(() => 1010 - (velocidadSlider.value * 10));

// Ajusta el SVG a la medida REAL del contenedor. Se usa ResizeObserver
// en vez de window.resize porque es confiable al rotar el móvil.
// Nota: renderizarBarras.js también recalcula el ancho por su cuenta,
// así que esto queda como respaldo para mantener configSVG.ancho al día.
let observadorContenedor = null;
const ajustarGrafica = () => {
  if (!contenedorGrafico.value || !svg) return;

  // A mitad de rotación clientWidth puede reportar 0: ignorar esa medición
  const ancho = contenedorGrafico.value.clientWidth;
  if (!ancho) return;

  configSVG.ancho = ancho;
  svg.attr("width", ancho);

  if (datos.length > 0) {
    renderizarBarras(datos, 0, contenedorGrafico.value,true);
  }
};

onMounted(async () => {
  // 1. Obligamos a la lógica a esperar a que el HTML esté completamente en el DOM
  await nextTick();

  // 2. Le damos 50ms al navegador del celular para aplicar los estilos de Tailwind
  setTimeout(() => {
    if (!contenedorGrafico.value) return;

    // 3. Fallback inteligente: si clientWidth lee 0, toma el ancho de la pantalla del móvil menos un pequeño margen
    configSVG.ancho = contenedorGrafico.value.clientWidth || (window.innerWidth - 40);

    svg = d3.select(contenedorGrafico.value)
      .append("svg")
      .attr("width", configSVG.ancho)
      .attr("height", configSVG.alto);

    parsearInputYRenderizar();
  }, 50);

  // 4. Observamos el CONTENEDOR (no la ventana): al girar el móvil el
  // redibujo ocurre cuando el layout ya asentó y con la medida real.
  observadorContenedor = new ResizeObserver(ajustarGrafica);
  observadorContenedor.observe(contenedorGrafico.value);
});

// Al salir de la vista: dejar de observar para no dejar callbacks huérfanos
onBeforeUnmount(() => {
  observadorContenedor?.disconnect();
});

// Controladores
const parsearInputYRenderizar = () => {
  const valores = valoresInput.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
  datos = valores.map(v => ({ id: generarId(), valor: v, estado: 'default' }));
  renderizarBarras(datos, 0, contenedorGrafico.value,true);
};

const iniciarCronometro = () => {
  if (!timerId) {
    tiempoInicio.value = Date.now() - tiempoPausadoAcumulado.value;
    timerId = setInterval(() => {
      tiempoActual.value = Date.now();
    }, 10);
  }
};

const detenerCronometro = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    tiempoPausadoAcumulado.value = tiempoActual.value - tiempoInicio.value;
  }
};

const reproducirSiguientePaso = () => {
  // Aunque quede un timeout suelto, un paso NUNCA se ejecuta si está pausado o no corre nada.
  if (!estaEjecutando.value || estaPausado.value) return;
  if (!algoritmoPausado) return;

  const paso = algoritmoPausado.next();

  if (paso.done || (paso.value && paso.value.finalizado)) {
    algoritmoPausado = null;
    temporizadorAnimacion = null; // Limpiar el handle
    estaEjecutando.value = false; // Terminó → nada está corriendo
    detenerCronometro(); // El algoritmo terminó
    estaPausado.value = false; // Resetear botón
    if (paso.value) renderizarBarras(paso.value.arr, velocidadMs.value, contenedorGrafico.value, true);
    return;
  }

  renderizarBarras(paso.value.arr, velocidadMs.value, contenedorGrafico.value, true);
  temporizadorAnimacion = setTimeout(reproducirSiguientePaso, velocidadMs.value + 20);
};

watch(valoresInput, () => {
  // 1. Detener cualquier ordenamiento que esté en proceso
  if (temporizadorAnimacion) {
    clearTimeout(temporizadorAnimacion);
    temporizadorAnimacion = null;
  }

  // 2. Apagar y resetear el cronómetro
  detenerCronometro();
  algoritmoPausado = null;
  estaEjecutando.value = false; // Cancelado: nada está corriendo
  tiempoPausadoAcumulado.value = 0;
  tiempoActual.value = 0;
  estaPausado.value = false; // <-- Restablece el botón a "Pausar"
  tiempoInicio.value = 0;

  // 3. Leer el nuevo texto y dibujar la previsualización al instante
  parsearInputYRenderizar();
});

const iniciarOrdenamiento = () => {
  if (estaEjecutando.value) return; // Evita crear dos cadenas de pasos activas a la vez
  if (temporizadorAnimacion) clearTimeout(temporizadorAnimacion);
  parsearInputYRenderizar();

  estaEjecutando.value = true;
  tiempoPausadoAcumulado.value = 0;
  tiempoActual.value = 0;
  estaPausado.value = false; // Resetear botón
  iniciarCronometro();

  // Enrutar dependiendo de lo que el usuario seleccionó en la interfaz
  switch (algoritmoSeleccionado.value) {
    case 'bubble':
      algoritmoPausado = bubbleSortGenerador(datos);
      break;
    case 'insertion':
      algoritmoPausado = insertionSortGenerador(datos);
      break;
    case 'quicksort':
      algoritmoPausado = quickSortGenerador(datos);
      break;
    case 'selection':
    default:
      algoritmoPausado = selectionSortGenerador(datos);
      break;
  }
  reproducirSiguientePaso();
};

// Patrón de Rendimiento.vue: PRIMERO el toggle de estado, DESPUÉS reaccionar a él.
const pausarOrdenamiento = () => {
  if (!estaEjecutando.value) return; // Nada corriendo → el botón no hace nada

  estaPausado.value = !estaPausado.value; // 1. El estado explícito manda

  if (estaPausado.value) {
    // 2a. PAUSAR: cortar cadena de pasos + cronómetro + congelar barras en vuelo
    if (temporizadorAnimacion) {
      clearTimeout(temporizadorAnimacion);
      temporizadorAnimacion = null;
    }
    detenerCronometro();
    // Congela las barras donde estén: sin interrupt(), una transición de D3
    // que esté en vuelo terminaría de moverse aunque el usuario ya pausó.
    d3.select(contenedorGrafico.value).selectAll('rect').interrupt();
  } else {
    // 2b. REANUDAR: el generador sigue vivo y retoma donde quedó.
    // Se programa con setTimeout (igual que Rendimiento) en vez de llamar
    // directo: da margen a la transición y reutiliza la ruta del bucle.
    iniciarCronometro();
    temporizadorAnimacion = setTimeout(reproducirSiguientePaso, velocidadMs.value);
  }
};

const reiniciarOrdenamiento = () => {
  // 1. Detener cualquier animación en curso de forma segura
  if (temporizadorAnimacion) {
    clearTimeout(temporizadorAnimacion);
    temporizadorAnimacion = null;
  }

  // 2. Detener el intervalo del cronómetro
  detenerCronometro();

  // 3. Resetear todas las variables de tiempo a cero
  tiempoPausadoAcumulado.value = 0;
  tiempoActual.value = 0;
  tiempoInicio.value = 0;

  // 4. Resetear los estados del reproductor y botón
  algoritmoPausado = null;
  estaEjecutando.value = false; // Reiniciado: nada está corriendo
  estaPausado.value = false;

  // 5. Redibujar el gráfico en su estado inicial
  parsearInputYRenderizar();
};

</script>

<template>
  <section class="w-full fondo-gradiente text-white lexend py-7" aria-labelledby="titulo-principal"
    aria-describedby="desc-principal">
    <div class="max-w-2xl mx-auto px-4 text-center">
      <h1 class="text-title p-[0.3em] mt-1 text-wrap" id="titulo-principal">
        Panel de ordenamiento personalizado
      </h1>
      <hr class="w-full border-t-3 border-gray-400/60 mt-2 mb-4" />
      <p class="text-wrap text-subtitle mt-2 mb-5" id="desc-principal">
        Ingresa una lista de valores, selecciona el algoritmo
        de ordenamiento de tu preferencia y <span
          class="bg-linear-to-r from-[#ED9C71] to-[#F9DC8A] bg-clip-text text-transparent">visualiza paso a
          paso
          cómo se organiza la información.</span>
      </p>
    </div>
  </section>

  <section class="fondo-gradiente w-full py-6 px-4" aria-labelledby="titulo-config">

    <!-- Tarjeta contenedora -->
    <div
      class="max-w-4xl mx-auto bg-[#1e1e20] border-2 border-[#000000] rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6">

      <!-- Título principal -->
      <h2 id="titulo-config" class="text-center text-subtitle lexend text-gray-100">
        Configuración de datos
      </h2>

      <!-- Campo de entrada de valores -->
      <div class="input-group">
        <label for="values" class="sr-only">Ingrese los valores</label>
        <textarea v-model="valoresInput" id="values" name="values" aria-describedby="help-values"
          placeholder="Ingrese los valores separados por comas"
          class="w-full h-32 bg-[#444446] border-2 border-[#000000] text-gray-100 placeholder-gray-300 text-center rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#f1d374] resize-none text-body lexend flex items-center justify-center leading-loose"></textarea>
      </div>

      <!-- Selección de algoritmo -->
      <div class="input-group space-y-2">
        <label for="algoritmo" class="block text-button lexend text-gray-200 text-left">
          Seleccionar método de ordenamiento
        </label>
        <div class="relative">
          <select v-model="algoritmoSeleccionado" id="algoritmo" name="algoritmo"
            class="w-full bg-[#444446] border-2 border-[#000000] text-gray-100 text-body lexend rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#f1d374] cursor-pointer pr-10">
            <option value="bubble">Burbuja</option>
            <option value="selection">Selección</option>
            <option value="insertion">Inserción</option>
            <option value="quicksort">Quicksort</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7">
              </path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Botones de control y slider de velocidad -->
      <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div class="flex flex-wrap items-center gap-3">
          <button @click="iniciarOrdenamiento" type="button"
            class="bg-[#FFE77A] hover:bg-[#e0c263] text-black lexend px-6 py-2 rounded-xl text-button transition-colors shadow-sm">
            Iniciar
          </button>
          <button @click="pausarOrdenamiento" type="button" :disabled="!estaEjecutando"
            class="bg-[#FFE77A] hover:bg-[#e0c263] text-black lexend px-6 py-2 rounded-xl text-button transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {{ estaPausado ? 'Reanudar' : 'Pausar' }}
          </button>
          <button @click="reiniciarOrdenamiento" type="button"
            class="bg-[#FFE77A] hover:bg-[#e0c263] text-black lexend px-6 py-2 rounded-xl text-button transition-colors shadow-sm">
            Reiniciar
          </button>
        </div>

        <!-- Deslizador de velocidad -->
        <div class="flex items-center gap-3 text-body lexend text-gray-200">
          <label for="velocidad">Velocidad</label>
          <input type="range" v-model="velocidadSlider" id="velocidad" min="1" max="100"
            class="w-36 sm:w-48 h-2 bg-[#444446] rounded-lg appearance-none cursor-pointer accent-blue-600">
        </div>
      </div>

    </div>

  </section>

  <section class="fondo-gradiente w-full py-7 px-4" aria-labelledby="titulo-resultado">
    <h2 id="titulo-resultado" class="text-center text-white lexend text-subtitle mb-4">
      Resultado del ordenamiento
    </h2>

    <!-- p-3 en móviles, p-8 en desktop, y flexbox para la estructura -->
    <div
      class="max-w-4xl mx-auto bg-[#1e1e20] border-2 border-[#000000] rounded-3xl p-3 sm:p-8 text-white shadow-2xl flex flex-col gap-4 sm:gap-6">

      <!-- Contenedor del gráfico garantizando ancho total -->
      <figure ref="contenedorGrafico" id="contenedorGrafico" class="grafico w-full flex items-center justify-center">
        <!-- gráfico dinámico -->
      </figure>

      <!-- Contenedor para alinear el cronómetro a la izquierda sin margen extra -->
      <div class="flex justify-start px-2 sm:px-0">
        <time class="timer bg-[#FFE77A] text-black lexend px-6 py-2 rounded-xl text-button">
          {{ tiempoFormateado }}
        </time>
      </div>
    </div>
  </section>
</template>

<style></style>