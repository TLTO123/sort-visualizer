<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import * as d3 from 'd3';

// Referencias de la interfaz
const valoresInput = ref("26, 87, 30, 19, 63, 83, 27, 88, 81, 26, 79, 75, 76, 84, 36");
const algoritmoSeleccionado = ref("bubble");
const velocidadSlider = ref(50);
const estaPausado = ref(false);
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

const configSVG = { ancho: 800, alto: 450, margen: 15 };
const velocidadMs = computed(() => 1010 - (velocidadSlider.value * 10));

onMounted(() => {
  // 1. Obtener el ancho real del contenedor en la pantalla del usuario
  configSVG.ancho = contenedorGrafico.value.clientWidth || 800;

  // 2. Crear el SVG usando dimensiones fijas (sin viewBox)
  svg = d3.select(contenedorGrafico.value)
    .append("svg")
    .attr("width", configSVG.ancho)
    .attr("height", configSVG.alto);

  parsearInputYRenderizar();

  // 3. Escuchar cambios de tamaño (por si el usuario rota el móvil)
  window.addEventListener('resize', () => {
    if (!contenedorGrafico.value) return;

    // Recalcular el ancho y actualizar el SVG instantáneamente
    configSVG.ancho = contenedorGrafico.value.clientWidth;
    svg.attr("width", configSVG.ancho);

    // Redibujar las barras para que se adapten al nuevo espacio
    if (datos.length > 0) {
      renderizarBarras(datos, 0);
    }
  });
});

// Selector de colores basado en el estado
const obtenerColor = (estado) => {
  if (estado === 'comparando') return '#FFB3BA'; // Rosa claro
  if (estado === 'minimo') return '#7DD3FC';     // Azul claro
  if (estado === 'ordenado') return '#374151';   // Gris un poco más oscuro
  return '#4B5563'; // Gris oscuro base (default)
};

function renderizarBarras(arreglo, duracion = 0) {
  if (!svg) return;

  const anchoBarra = (configSVG.ancho - (configSVG.margen * 2)) / arreglo.length;
  // Si la barra es muy estrecha, reducimos el espacio entre ellas para aprovechar píxeles
  const espacio = anchoBarra > 15 ? 6 : 2;
  const valorMaximo = d3.max(arreglo, d => d.valor) || 1;
  const escalaY = d3.scaleLinear().domain([0, valorMaximo]).range([0, configSVG.alto - 50]);

  // 1. Renderizar Rectángulos (Barras)
  const barras = svg.selectAll("rect.barra")
    .data(arreglo, d => d.id);

  barras.enter()
    .append("rect")
    .attr("class", "barra")
    .attr("y", configSVG.alto)
    .attr("height", 0)
    .attr("rx", 6) // Bordes redondeados de la imagen
    .attr("ry", 6)
    .merge(barras)
    .transition().duration(duracion)
    .attr("x", (d, i) => i * anchoBarra + configSVG.margen)
    .attr("y", d => configSVG.alto - escalaY(d.valor))
    .attr("width", anchoBarra - espacio)
    .attr("height", d => escalaY(d.valor))
    .attr("fill", d => obtenerColor(d.estado));

  barras.exit().remove();

  // 2. Renderizar Textos (Valores encima de las barras)
  const textos = svg.selectAll("text.etiqueta")
    .data(arreglo, d => d.id);

  textos.enter()
    .append("text")
    .attr("class", "etiqueta text-white lexend font-bold text-sm")
    .attr("text-anchor", "middle")
    .attr("fill", "#ffffff")
    .attr("y", configSVG.alto)
    .merge(textos)
    .text(d => d.valor)
    // Usamos opacity como interruptor infalible y reevaluamos el tamaño en cada render
    .style("opacity", anchoBarra < 30 ? 0 : 1)
    .attr("font-size", anchoBarra < 40 ? "11px" : "14px")
    .transition().duration(duracion)
    .attr("x", (d, i) => (i * anchoBarra + configSVG.margen) + ((anchoBarra - espacio) / 2))
    .attr("y", d => configSVG.alto - escalaY(d.valor) - 10); // 10px arriba de la barra

  textos.exit().remove();
}

// Funciones que ejecutan los métodos de ordenamiento
// --- MÉTODO SELECCIÓN (SELECTION SORT) ---
function* selectionSortGenerador(arreglo) {
  let arr = arreglo.map(d => ({ ...d, estado: 'default' }));
  let n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    arr[minIdx].estado = 'minimo';
    yield { arr: [...arr] }; // Renderiza el azul

    for (let j = i + 1; j < n; j++) {
      arr[j].estado = 'comparando';
      yield { arr: [...arr] }; // Renderiza el rosa temporalmente

      if (arr[j].valor < arr[minIdx].valor) {
        arr[minIdx].estado = 'default';
        minIdx = j;
        arr[minIdx].estado = 'minimo'; // Nuevo azul
        yield { arr: [...arr] };
      } else {
        arr[j].estado = 'default';
      }
    }

    if (minIdx !== i) {
      let temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
      yield { arr: [...arr] }; // Anima el intercambio
    }
    arr[i].estado = 'ordenado';
  }
  arr[n - 1].estado = 'ordenado';
  yield { arr: [...arr], finalizado: true };
}

// --- MÉTODO QUICKSORT ---
function* quickSortGenerador(arreglo) {
  let arr = arreglo.map(d => ({ ...d, estado: 'default' }));

  // Función partición interna
  function* particion(low, high) {
    let pivotIdx = high;
    arr[pivotIdx].estado = 'minimo'; // El pivote se pinta azul
    yield { arr: [...arr] };

    let i = low - 1;
    for (let j = low; j < high; j++) {
      arr[j].estado = 'comparando';
      yield { arr: [...arr] };

      if (arr[j].valor < arr[pivotIdx].valor) {
        i++;
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        yield { arr: [...arr] };
      }
      arr[j].estado = 'default';
    }

    // Colocar el pivote en su posición final
    i++;
    let temp = arr[i];
    arr[i] = arr[pivotIdx];
    arr[pivotIdx] = temp;

    arr[i].estado = 'ordenado'; // Este pivote ya encontró su lugar final
    yield { arr: [...arr] };
    return i;
  }

  // Función recursiva interna. Usamos yield* para delegar el control
  function* quickSortHelper(low, high) {
    if (low < high) {
      let pi = yield* particion(low, high);
      yield* quickSortHelper(low, pi - 1);
      yield* quickSortHelper(pi + 1, high);
    } else if (low === high) {
      arr[low].estado = 'ordenado';
      yield { arr: [...arr] };
    }
  }

  yield* quickSortHelper(0, arr.length - 1);

  // Seguro final: forzar que todo se pinte como ordenado
  arr.forEach(d => d.estado = 'ordenado');
  yield { arr: [...arr], finalizado: true };
}

// Controladores
const parsearInputYRenderizar = () => {
  const valores = valoresInput.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
  datos = valores.map(v => ({ id: crypto.randomUUID(), valor: v, estado: 'default' }));
  renderizarBarras(datos, 0);
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
  if (!algoritmoPausado) return;
  const paso = algoritmoPausado.next();

  if (paso.done || (paso.value && paso.value.finalizado)) {
    algoritmoPausado = null;
    detenerCronometro(); // El algoritmo terminó
    estaPausado.value = false; // Resetear botón
    if (paso.value) renderizarBarras(paso.value.arr, velocidadMs.value);
    return;
  }

  renderizarBarras(paso.value.arr, velocidadMs.value);
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
  tiempoPausadoAcumulado.value = 0;
  tiempoActual.value = 0;
  estaPausado.value = false; // <-- Restablece el botón a "Pausar"
  tiempoInicio.value = 0;

  // 3. Leer el nuevo texto y dibujar la previsualización al instante
  parsearInputYRenderizar();
});

const iniciarOrdenamiento = () => {
  if (temporizadorAnimacion) clearTimeout(temporizadorAnimacion);
  parsearInputYRenderizar();

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

const pausarOrdenamiento = () => {
  if (temporizadorAnimacion) {
    clearTimeout(temporizadorAnimacion);
    temporizadorAnimacion = null;
    detenerCronometro();
    estaPausado.value = true;
  } else if (algoritmoPausado) {
    iniciarCronometro();
    reproducirSiguientePaso();
    estaPausado.value = false;
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
      <p class="text-wrap mt-2 mb-5" id="desc-principal">
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
          <button @click="pausarOrdenamiento" type="button"
            class="bg-[#FFE77A] hover:bg-[#e0c263] text-black lexend px-6 py-2 rounded-xl text-button transition-colors shadow-sm">
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

    <!-- Cambio principal: p-3 en móviles, p-8 en desktop, y flexbox para la estructura -->
    <div
      class="max-w-4xl mx-auto bg-[#1e1e20] border-2 border-[#000000] rounded-3xl p-3 sm:p-8 text-white shadow-2xl flex flex-col gap-4 sm:gap-6">

      <!-- Contenedor del gráfico garantizando ancho total -->
      <figure ref="contenedorGrafico" class="grafico w-full flex items-center justify-center">
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