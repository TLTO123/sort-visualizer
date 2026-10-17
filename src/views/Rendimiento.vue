<script setup>
// ============================================================
// ARCHIVO: views/Rendimiento.vue
// RESPONSABLE: prueba de rendimiento con los 4 algoritmos EN PARALELO
// CONCEPTOS CLAVE:
//   - Los algoritmos son GENERADORES (function* + yield): cada yield es
//     una "foto" del arreglo lista para animarse.
//   - Cada algoritmo tiene su "hilo" propio: generador + setTimeout +
//     cronómetro, indexados por su selector CSS en diccionarios.
//   - Cada algoritmo ordena una COPIA independiente de la lista.
//   - El estado de ejecución es EXPLÍCITO (estaEjecutando/estaPausado):
//     el botón reacciona al estado, nunca se infiere de efectos secundarios.
//   - Responsividad con ResizeObserver sobre cada contenedor (no
//     window.resize): en móvil la rotación dispara eventos poco fiables.
// ============================================================

import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import * as d3 from 'd3';
import { renderizarBarras } from '../components/renderizarBarras.js';
import { bubbleSortGenerador } from '../algorithms/generadores.js';
import { selectionSortGenerador } from '../algorithms/generadores.js';
import { insertionSortGenerador } from '../algorithms/generadores.js';
import { quickSortGenerador } from '../algorithms/generadores.js';
import { generarId } from '../utils/ids.js'; // Id con fallback: funciona también en http por IP (móvil)

// Estado de la simulación
const estaPausado = ref(false);
const estaEjecutando = ref(false);
const velocidadSlider = ref(50);
const velocidadMs = computed(() => 1010 - velocidadSlider.value * 10);
const listaNumeros = ref([]);

const selectores = [
  '#grafico-bubble',
  '#grafico-selection',
  '#grafico-insertion',
  '#grafico-quicksort'
];
const ALTO_GRAFICA = 250;

// Cada algoritmo tiene su propio generador, animación y cronómetro.
const algoritmosActivos = {};
const temporizadoresAnimacion = {};
const timersAlgoritmos = {};
const inicioCronometros = {};
const estadosVisuales = {};

const tiemposAlgoritmos = ref({
  '#grafico-bubble': 0,
  '#grafico-selection': 0,
  '#grafico-insertion': 0,
  '#grafico-quicksort': 0
});

const formatearTiempo = (ms) => {
  const minutos = String(Math.floor(ms / 60000)).padStart(2, '0');
  const segundos = String(Math.floor((ms / 1000) % 60)).padStart(2, '0');
  const centesimas = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
  return `${minutos}:${segundos}:${centesimas}`;
};

// El cronómetro conserva el tiempo acumulado al pausar y reanudar.
const iniciarCronometroAlgoritmo = (selector) => {
  if (timersAlgoritmos[selector] != null) return;

  const acumulado = tiemposAlgoritmos.value[selector];
  const inicio = performance.now();
  inicioCronometros[selector] = { acumulado, inicio };

  timersAlgoritmos[selector] = setInterval(() => {
    tiemposAlgoritmos.value[selector] =
      acumulado + (performance.now() - inicio);
  }, 10);
};

const detenerCronometroAlgoritmo = (selector) => {
  if (timersAlgoritmos[selector] == null) return;

  const marca = inicioCronometros[selector];
  if (marca) {
    tiemposAlgoritmos.value[selector] =
      marca.acumulado + (performance.now() - marca.inicio);
  }

  clearInterval(timersAlgoritmos[selector]);
  timersAlgoritmos[selector] = null;
  delete inicioCronometros[selector];
};

// Guarda una copia del último paso para redibujar sin perder el progreso.
const dibujarPaso = (selector, arreglo, duracion = 0) => {
  estadosVisuales[selector] = arreglo.map((item) => ({ ...item }));
  renderizarBarras(estadosVisuales[selector], duracion, selector);
};

const actualizarTodasLasGraficas = (duracion = 0) => {
  selectores.forEach((selector) => {
    dibujarPaso(selector, listaNumeros.value, duracion);
  });
};

// Cancela completamente una simulación anterior (también si está pausada).
const detenerTodasLasAnimaciones = () => {
  estaEjecutando.value = false;
  estaPausado.value = false;

  selectores.forEach((selector) => {
    clearTimeout(temporizadoresAnimacion[selector]);
    temporizadoresAnimacion[selector] = null;

    detenerCronometroAlgoritmo(selector);
    algoritmosActivos[selector] = null;

    // Evita que una transición de D3 siga moviendo las barras.
    d3.select(selector).selectAll('rect').interrupt();
  });
};

const reiniciarTiempos = () => {
  selectores.forEach((selector) => {
    tiemposAlgoritmos.value[selector] = 0;
  });
};

// Ejecuta un paso del generador y programa el siguiente.
const reproducirSiguientePaso = (selector) => {
  if (!estaEjecutando.value || estaPausado.value) return;

  const generador = algoritmosActivos[selector];
  if (!generador) return;

  const paso = generador.next();

  if (paso.done || paso.value?.finalizado) {
    if (paso.value?.arr) {
      dibujarPaso(selector, paso.value.arr, 0);
    }

    algoritmosActivos[selector] = null;
    temporizadoresAnimacion[selector] = null;
    detenerCronometroAlgoritmo(selector);

    if (selectores.every((id) => !algoritmosActivos[id])) {
      estaEjecutando.value = false;
      estaPausado.value = false;
    }
    return;
  }

  dibujarPaso(selector, paso.value.arr, velocidadMs.value);
  temporizadoresAnimacion[selector] = setTimeout(() => {
    reproducirSiguientePaso(selector);
  }, velocidadMs.value + 20);
};

const iniciarTodosLosOrdenamientos = () => {
  // Impide que varios clics creen animaciones duplicadas.
  if (estaEjecutando.value || listaNumeros.value.length === 0) return;

  detenerTodasLasAnimaciones();
  reiniciarTiempos();
  estaEjecutando.value = true;

  const configuracion = [
    { selector: '#grafico-bubble', generador: bubbleSortGenerador },
    { selector: '#grafico-selection', generador: selectionSortGenerador },
    { selector: '#grafico-insertion', generador: insertionSortGenerador },
    { selector: '#grafico-quicksort', generador: quickSortGenerador }
  ];

  configuracion.forEach(({ selector, generador }) => {
    const copia = listaNumeros.value.map((item) => ({ ...item, estado: 'default' }));
    algoritmosActivos[selector] = generador(copia);
    dibujarPaso(selector, copia, 0);
    iniciarCronometroAlgoritmo(selector);

    temporizadoresAnimacion[selector] = setTimeout(() => {
      reproducirSiguientePaso(selector);
    }, 50);
  });
};

const pausarOrdenamiento = () => {
  if (!estaEjecutando.value) return;

  estaPausado.value = !estaPausado.value;

  if (estaPausado.value) {
    selectores.forEach((selector) => {
      clearTimeout(temporizadoresAnimacion[selector]);
      temporizadoresAnimacion[selector] = null;
      detenerCronometroAlgoritmo(selector);
      d3.select(selector).selectAll('rect').interrupt();
    });
  } else {
    selectores.forEach((selector) => {
      // Un algoritmo que ya terminó no debe volver a arrancar.
      if (!algoritmosActivos[selector]) return;
      iniciarCronometroAlgoritmo(selector);
      temporizadoresAnimacion[selector] = setTimeout(() => {
        reproducirSiguientePaso(selector);
      }, velocidadMs.value);
    });
  }
};

const reiniciarOrdenamiento = () => {
  detenerTodasLasAnimaciones();
  reiniciarTiempos();

  // Conserva los mismos números, pero en el orden original.
  listaNumeros.value = listaNumeros.value.map((item) => ({
    ...item,
    estado: 'default'
  }));
  actualizarTodasLasGraficas(0);
};

const generarNuevaLista = () => {
  detenerTodasLasAnimaciones();
  reiniciarTiempos();

  const cantidad = Math.floor(Math.random() * 31) + 10;
  listaNumeros.value = Array.from({ length: cantidad }, () => ({
    id: generarId(),
    valor: Math.floor(Math.random() * 91) + 10,
    estado: 'default'
  }));

  actualizarTodasLasGraficas(0);
};

// ---------------- CREACIÓN Y AJUSTE DE GRÁFICAS ----------------
let observadorContenedores = null; // ResizeObserver de los 4 contenedores
let ajustePendiente = false;

const ajustarGraficas = () => {
  // Durante una rotación llegan muchos eventos seguidos: en vez de
  // redibujar 4 gráficas en cada uno, se redibuja UNA vez por frame.
  if (ajustePendiente) return;
  ajustePendiente = true;

  requestAnimationFrame(() => {
    ajustePendiente = false;

    selectores.forEach((selector) => {
      const contenedor = document.querySelector(selector);
      if (!contenedor) return;

      // A mitad de rotación el contenedor puede medir 0 un instante:
      // ignorar esa medición transitoria en vez de escribir un ancho
      // falso que ya nadie corregiría (ese era el bug al volver a vertical).
      const ancho = contenedor.clientWidth;
      if (!ancho) return;

      d3.select(selector).select('svg').attr('width', ancho);
      const datos = estadosVisuales[selector] || listaNumeros.value;
      if (datos.length) renderizarBarras(datos, 0, selector);
    });
  });
};

onMounted(() => {
  selectores.forEach((selector) => {
    const contenedor = document.querySelector(selector);
    if (!contenedor) {
      console.warn(`No se encontró el contenedor: ${selector}`);
      return;
    }

    d3.select(selector).selectAll('svg').remove();
    d3.select(selector)
      .append('svg')
      .attr('width', contenedor.clientWidth || 400)
      .attr('height', ALTO_GRAFICA);
  });

  generarNuevaLista();

  // Se observa el CONTENEDOR, no la ventana: en móvil, girar el teléfono
  // a veces dispara resize con medidas viejas o no dispara nada. El
  // ResizeObserver redibuja cuando el contenedor ya tiene su medida FINAL.
  observadorContenedores = new ResizeObserver(ajustarGraficas);
  selectores.forEach((selector) => {
    const contenedor = document.querySelector(selector);
    if (contenedor) observadorContenedores.observe(contenedor);
  });
});

onBeforeUnmount(() => {
  detenerTodasLasAnimaciones();
  observadorContenedores?.disconnect(); // Dejar de observar al salir de la vista
});
</script>

<template>
  <div class="contenedor">
    <header class="cabecera lexend">
      <h2 class="subtitulo text-title">Prueba de rendimiento (Demostración simultánea)</h2>
      <p class="descripcion text-subtitle">
        Compara el rendimiento de los diferentes algoritmos de ordenamiento mediante
        una simulación interactiva.
        <span class="bg-linear-to-r from-[#ED9C71] to-[#F9DC8A] bg-clip-text text-transparent">
          Genera un conjunto de datos, ajusta la velocidad de
        </span>
        <span class="bg-linear-to-r from-[#3BA4B3] to-[#40D3E1] bg-clip-text text-transparent">
          ejecución y observa el tiempo que tarda cada método en completar el proceso.
        </span>
      </p>
    </header>

    <section class="controles-rendimiento">
      <div class="botones lexend text-button">
        <button class="btn" @click="generarNuevaLista">Generar nueva lista aleatoria</button>
        <button class="btn" @click="iniciarTodosLosOrdenamientos" :disabled="estaEjecutando">
          Iniciar
        </button>
        <button class="btn" @click="pausarOrdenamiento" :disabled="!estaEjecutando">
          {{ estaPausado ? 'Reanudar' : 'Pausar' }}
        </button>
        <button class="btn" @click="reiniciarOrdenamiento">Reiniciar</button>
      </div>

      <div class="rango-velocidad">
        <label for="velocidad" class="lexend text-button">Velocidad</label>
        <input
          id="velocidad"
          v-model.number="velocidadSlider"
          type="range"
          min="1"
          max="100"
          :style="{
            background: `linear-gradient(to right, #1F3B8A ${velocidadSlider}%, #484848 ${velocidadSlider}%)`
          }"
        >
      </div>
    </section>

    <section class="resultados-grid">
      <article class="tarjeta-algoritmo lexend">
        <!-- El nombre viene de algoritmos.json, pero el algoritmo que corre aquí
             (bubbleSortGenerador en generadores.js) es burbuja simple, no bidireccional -->
        <h3 class="text-subtitle">Burbuja (Bidireccional)</h3>
        <div id="grafico-bubble" class="contenedor-svg"></div>
        <time class="cronometro text-button">{{ formatearTiempo(tiemposAlgoritmos['#grafico-bubble']) }}</time>
      </article>

      <article class="tarjeta-algoritmo lexend">
        <h3 class="text-subtitle">Ordenamiento por Selección</h3>
        <div id="grafico-selection" class="contenedor-svg"></div>
        <time class="cronometro text-button">{{ formatearTiempo(tiemposAlgoritmos['#grafico-selection']) }}</time>
      </article>

      <article class="tarjeta-algoritmo lexend">
        <h3 class="text-subtitle">Ordenamiento por Inserción</h3>
        <div id="grafico-insertion" class="contenedor-svg"></div>
        <time class="cronometro text-button">{{ formatearTiempo(tiemposAlgoritmos['#grafico-insertion']) }}</time>
      </article>

      <article class="tarjeta-algoritmo lexend">
        <h3 class="text-subtitle">Quicksort (Ordenamiento rápido)</h3>
        <div id="grafico-quicksort" class="contenedor-svg"></div>
        <time class="cronometro text-button">{{ formatearTiempo(tiemposAlgoritmos['#grafico-quicksort']) }}</time>
      </article>
    </section>
  </div>
</template>

<style scoped>
.contenedor-svg {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  height: 250px;
  overflow: hidden;
  box-sizing: border-box;
}

.contenedor-svg svg {
  display: block;
  width: 100%;
  max-width: 100%;
  height: 250px;
}

.contenedor {
  background-color: #1E1E1E;
  color: #FFFFFF;
  min-height: 100vh;
  padding: 2rem 1rem;
  font-family: sans-serif;
  text-align: center;
}

.cabecera {
  margin-bottom: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.subtitulo { margin-bottom: 1.5rem; }
.descripcion { line-height: 1.5; }

.controles-rendimiento {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.botones {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.btn,
.cronometro {
  background-color: #FCE67E;
  color: #000000;
  border: none;
  border-radius: 10px;
}

.btn {
  padding: 0.6rem 1.5rem;
  cursor: pointer;
}

.btn:not(:disabled):hover { opacity: 0.7; }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.rango-velocidad {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
}

input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 10px;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 100%;
  background: #FFFFFF;
  cursor: pointer;
}

input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 100%;
  border: none;
  background: #FFFFFF;
  cursor: pointer;
}

.resultados-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.tarjeta-algoritmo {
  background-color: #272727;
  border: 1px solid #333333;
  border-radius: 12px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tarjeta-algoritmo h3 { margin-bottom: 1.5rem; }

.contenedor-svg {
  width: 100%;
  height: 250px;
  border-bottom: 1px solid #555;
  margin: 0 0 1.5rem;
}

.cronometro { padding: 0.4rem 1.2rem; }

@media (min-width: 768px) {
  .resultados-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .controles-rendimiento {
    flex-direction: row;
    justify-content: space-between;
  }
  .botones { flex-wrap: nowrap; }
  .rango-velocidad { width: 300px; }
}
</style>
