<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { renderizarBarras } from '../components/renderizarBarras.js';
import * as d3 from 'd3';

// Variable que simula el llenado azul de la barra de velocidad
const estaPausado = ref(false);
const velocidadSlider = ref(50);
//var de estado
let temporizadorAnimacion = null;
// Lista reactiva que contendrá los números
const listaNumeros = ref([]);

// Lógica del Cronómetro
const tiempoInicio = ref(0);
const tiempoActual = ref(0);
const tiempoPausadoAcumulado = ref(0);
let timerId = null;

// Objeto reactivo para llevar el tiempo independiente de cada algoritmo (en milisegundos)
const tiemposAlgoritmos = ref({
  '#grafico-bubble': 0,
  '#grafico-selection': 0,
  '#grafico-insertion': 0,
  '#grafico-quicksort': 0
});

// Marcas de tiempo de inicio para cada algoritmo
const tiemposInicioAlgoritmos = {};
// IDs de los intervalos o referencias de tiempo individuales
const timersAlgoritmos = {};

//métood para formatear el tiempo en minutos, segundos y centésimas
const formatearTiempo = (ms) => {
  const minutos = String(Math.floor((ms / 60000) % 60)).padStart(2, '0');
  const segundos = String(Math.floor((ms / 1000) % 60)).padStart(2, '0');
  const centesimas = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
  return `${minutos}:${segundos}:${centesimas}`;
};
// Creamos un array con los selectores para automatizar la creación
const selectores = ['#grafico-bubble', '#grafico-selection', '#grafico-quicksort', '#grafico-insertion'];
const configSVG = { alto: 250, margen: 15 };

const algoritmosActivos = {};
const temporizadoresAnimacion = {};
// Propiedad computada para traducir el valor del slider en milisegundos reales de espera
const velocidadMs = computed(() => 1010 - (velocidadSlider.value * 10));


// Función segura que actualiza las 4 gráficas en pantalla
const actualizarTodasLasGraficas = (velocidadAnimacion = 0) => {
  selectores.forEach(selector => {
    try {
      renderizarBarras(listaNumeros.value, velocidadAnimacion, selector);
    } catch (error) {
      console.error(`Error al renderizar en el contenedor ${selector}:`, error);
    }
  });
};

const detenerCronometro = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    tiempoPausadoAcumulado.value = tiempoActual.value - tiempoInicio.value;
  }
};

const iniciarCronometro = () => {
  if (!timerId) {
    tiempoInicio.value = Date.now() - tiempoPausadoAcumulado.value;
    timerId = setInterval(() => {
      tiempoActual.value = Date.now();
    }, 10);
  }
};

/**
 * Mueve un paso hacia adelante el algoritmo vinculado al ID correspondiente
 * @param {String} selector - El ID exacto del contenedor (ej: '#grafico-selection')
 */
const reproducirSiguientePaso = (selector) => {
  const generador = algoritmosActivos[selector];
  if (!generador) return;

  // Ejecutamos la siguiente iteración del generador
  const paso = generador.next();

  // Si el generador finalizó el ordenamiento
  if (paso.done || (paso.value && paso.value.finalizado)) {
    algoritmosActivos[selector] = null;

    // Detener el cronómetro individual de este selector
    if (timersAlgoritmos[selector]) {
      clearInterval(timersAlgoritmos[selector]);
      timersAlgoritmos[selector] = null;
    }
    if (paso.value) {
      renderizarBarras(paso.value.arr, velocidadMs.value, selector);
    }
    return;
  }

  // Renderizamos el paso actual en D3
  renderizarBarras(paso.value.arr, velocidadMs.value, selector);

  // Programamos el siguiente paso
  temporizadoresAnimacion[selector] = setTimeout(() => {
    reproducirSiguientePaso(selector);
  }, velocidadMs.value + 20);
};

/**
 * MÉTODO ORQUESTADOR SIMULTÁNEO
 * Inicializa los 4 algoritmos en paralelo usando la misma lista de partida original
 */
const iniciarTodosLosOrdenamientos = () => {
  // Limpieza preventiva de animaciones previas en ejecución
  selectores.forEach(selector => {
    if (temporizadoresAnimacion[selector]) clearTimeout(temporizadoresAnimacion[selector]);
    if (timersAlgoritmos[selector]) clearInterval(timersAlgoritmos[selector]);
    tiemposAlgoritmos.value[selector] = 0; // Resetear tiempo visual
  });
  if (!listaNumeros.value || listaNumeros.value.length === 0) return;

  //Encender el cronómetro general
  tiempoPausadoAcumulado.value = 0;
  tiempoActual.value = 0;
  estaPausado.value = false;
  iniciarCronometro();

  //Configuración de los 4 algoritmos simultáneos
  const configuracionSimulacion = [
    { selector: '#grafico-bubble', generadorFn: bubbleSortGenerador },
    { selector: '#grafico-selection', generadorFn: selectionSortGenerador },
    { selector: '#grafico-insertion', generadorFn: insertionSortGenerador },
    { selector: '#grafico-quicksort', generadorFn: quickSortGenerador }
  ];

  //Disparar los 4 hilos de animación en paralelo
  configuracionSimulacion.forEach(sim => {
    const copiaDatosUnica = JSON.parse(JSON.stringify(listaNumeros.value));

    // Instanciar el generador
    algoritmosActivos[sim.selector] = sim.generadorFn(copiaDatosUnica);

    // Renderizado inmediato del estado base limpio antes del primer paso
    renderizarBarras(copiaDatosUnica, 0, sim.selector);
    // Iniciar cronómetro individual para este selector
    const inicioAlgoritmo = Date.now();
    timersAlgoritmos[sim.selector] = setInterval(() => {
      tiemposAlgoritmos.value[sim.selector] = Date.now() - inicioAlgoritmo;
    }, 10);
    // Iniciar bucle visual para este ID tras un breve respiro
    setTimeout(() => {
      reproducirSiguientePaso(sim.selector);
    }, 50);
  });
};

/**
 * Inicializa el ordenamiento enfocado en un ID de contenedor gráfico específico
 * @param {String} selector - El ID exacto del contenedor (ej: '#grafico-selection')
 */
const iniciarOrdenamientoPorId = (selector) => {
  // Si ya había una animación activa en este ID, la limpiamos para evitar duplicados acelerados
  if (temporizadoresAnimacion[selector]) {
    clearTimeout(temporizadoresAnimacion[selector]);
  }

  tiempoPausadoAcumulado.value = 0;
  tiempoActual.value = 0;
  estaPausado.value = false;
  iniciarCronometro();

  //Clonación profunda: Creamos una copia exacta del arreglo para que este ID trabaje de forma aislada
  const copiaDatos = JSON.parse(JSON.stringify(listaNumeros.value));

  // Mapeo dinámico según el selector que mandes a llamar
  const generadoresPorId = {
    '#grafico-bubble': bubbleSortGenerador,
    '#grafico-selection': selectionSortGenerador,
    '#grafico-insertion': insertionSortGenerador,
    '#grafico-quicksort': quickSortGenerador
  };

  const funcionGeneradora = generadoresPorId[selector] || selectionSortGenerador;
  algoritmosActivos[selector] = funcionGeneradora(copiaDatos);

  reproducirSiguientePaso(selector);
};

// Controladores
const parsearInputYRenderizar = () => {
  let valores = listaNumeros.value.map(d => d.valor);
  listaNumeros.value = valores.map(v => ({ id: crypto.randomUUID(), valor: v, estado: 'default' }));
  renderizarBarras(listaNumeros.value, 0);
};

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

function* quickSortGenerador(arreglo) {
  let arr = arreglo.map(d => ({ ...d, estado: 'default' }));

  function* partition(low, high) {
    let pivot = arr[high];
    pivot.estado = 'minimo';
    let i = low - 1;

    for (let j = low; j <= high - 1; j++) {
      arr[j].estado = 'comparando';
      yield { arr: [...arr] };

      if (arr[j].valor < pivot.valor) {
        i++;
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        yield { arr: [...arr] };
      }
      arr[j].estado = 'default';
    }

    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    pivot.estado = 'default';
    yield { arr: [...arr] };

    return i + 1;
  }

  function* quickSortHelper(low, high) {
    if (low < high) {
      let piGen = partition(low, high);
      let pi = piGen.next();
      while (!pi.done) {
        yield pi.value;
        pi = piGen.next();
      }
      let piIndex = pi.value;

      let leftGen = quickSortHelper(low, piIndex - 1);
      for (let gen of leftGen) yield gen;

      let rightGen = quickSortHelper(piIndex + 1, high);
      for (let gen of rightGen) yield gen;
    } else if (low >= 0 && high >= 0 && low < arr.length && high < arr.length) {
      arr[low].estado = 'ordenado';
    }
  }

  let sortGen = quickSortHelper(0, arr.length - 1);
  for (let gen of sortGen) yield gen;

  // Marcar todos como ordenados al finalizar
  arr.forEach(d => d.estado = 'ordenado');
  yield { arr: [...arr], finalizado: true };
}

/**
 * Generador para Bubble Sort (Burbuja)
 */
function* bubbleSortGenerador(arreglo) {
  let arr = arreglo.map(d => ({ ...d, estado: 'default' }));
  let n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let huboIntercambio = false;

    for (let j = 0; j < n - i - 1; j++) {
      // Marcar los elementos que se están comparando
      arr[j].estado = 'comparando';
      arr[j + 1].estado = 'comparando';
      yield { arr: [...arr] };

      if (arr[j].valor > arr[j + 1].valor) {
        // Intercambiar elementos
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        huboIntercambio = true;
        yield { arr: [...arr] };
      }

      // Regresar al estado por defecto los que se compararon
      arr[j].estado = 'default';
      arr[j + 1].estado = 'default';
    }

    // Marcar el elemento ya ordenado al final del recorrido
    arr[n - 1 - i].estado = 'ordenado';

    if (!huboIntercambio) break; // Optimización si ya está ordenado
  }

  // Asegurar que todos queden marcados como ordenados al final
  arr.forEach(d => d.estado = 'ordenado');
  yield { arr: [...arr], finalizado: true };
}


/**
 * Generador para Insertion Sort (Inserción)
 */
function* insertionSortGenerador(arreglo) {
  let arr = arreglo.map(d => ({ ...d, estado: 'default' }));
  let n = arr.length;

  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;

    // Resaltar el elemento que se va a insertar
    key.estado = 'minimo';
    yield { arr: [...arr] };

    while (j >= 0 && arr[j].valor > key.valor) {
      arr[j + 1].estado = 'comparando';
      yield { arr: [...arr] };

      arr[j + 1] = arr[j];
      j = j - 1;
      yield { arr: [...arr] };
    }

    arr[j + 1] = key;

    // Marcar progresivamente los elementos ya recorridos como ordenados hasta la posición i
    for (let k = 0; k <= i; k++) {
      arr[k].estado = 'ordenado';
    }
    yield { arr: [...arr] };
  }

  // Marcar todos como ordenados al finalizar
  arr.forEach(d => d.estado = 'ordenado');
  yield { arr: [...arr], finalizado: true };
}

const generarNuevaLista = () => {
  // 1. Limpieza total de cualquier animación previa en los 4 paneles
  selectores.forEach(selector => {
    if (temporizadoresAnimacion[selector]) {
      clearTimeout(temporizadoresAnimacion[selector]);
      temporizadoresAnimacion[selector] = null;
    }
    algoritmosActivos[selector] = null;
  });

  // 2. Apagar y resetear el cronómetro general
  detenerCronometro();
  tiempoPausadoAcumulado.value = 0;
  tiempoActual.value = 0;
  estaPausado.value = false;
  tiempoInicio.value = 0;

  // 3. Generar la nueva lista con sus IDs correspondientes
  const cantidadElementos = Math.floor(Math.random() * (40 - 10 + 1)) + 10;
  const nuevoArreglo = [];

  for (let i = 0; i < cantidadElementos; i++) {
    const valorAleatorio = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
    nuevoArreglo.push({
      id: crypto.randomUUID(),
      valor: valorAleatorio,
      estado: 'default'
    });
  }

  // 4. Guardamos en la ref reactiva (al no haber watch, esto es 100% seguro y no causará bucles)
  listaNumeros.value = nuevoArreglo;

  // 5. Dibujar las barras iniciales en los 4 contenedores
  actualizarTodasLasGraficas(300);
};


onMounted(() => {

  // 1. Inicializamos los contenedores SVG en los 4 bloques
  selectores.forEach(selector => {
    const elemento = document.querySelector(selector);
    if (!elemento) {
      console.warn(`No se encontró el contenedor HTML para el selector: ${selector}`);
      return;
    }

    const anchoReal = elemento.clientWidth || 400;

    // Asegurar que no se dupliquen limpiando el HTML interno antes de inyectar
    d3.select(selector).selectAll("svg").remove();

    // Crea un SVG independiente dentro de cada uno de los 4 divs
    d3.select(selector)
      .append("svg")
      .attr("width", anchoReal)
      .attr("height", configSVG.alto);
  });

  // 2. Generamos la primera lista de números una vez que los SVGs ya existen
  generarNuevaLista();

  // 3. Escuchar el resize de la ventana de forma fluida
  window.addEventListener('resize', () => {
    selectores.forEach(selector => {
      const elemento = document.querySelector(selector);
      if (!elemento) return;

      const nuevoAncho = elemento.clientWidth;
      d3.select(selector).select("svg").attr("width", nuevoAncho);
    });
    actualizarTodasLasGraficas(0);
  });
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
        <button class="btn" @click="iniciarTodosLosOrdenamientos">Iniciar</button>
        <button class="btn" @click="pausarOrdenamiento">Pausar</button>
        <button class="btn" @click="reiniciarOrdenamiento">Reiniciar</button>
      </div>

      <div class="rango-velocidad">
        <label for="velocidad" class="lexend text-button">Velocidad</label>
        <input type="range" id="velocidad" min="1" max="100" v-model="velocidadSlider"
          :style="{ background: `linear-gradient(to right, #1F3B8A ${velocidadSlider}%, #484848 ${velocidadSlider}%)` }">
      </div>
    </section>

    <section class="resultados-grid">
      <article class="tarjeta-algoritmo lexend">
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
/* scoped para que no afecte a los otros */
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

.subtitulo {
  margin-bottom: 1.5rem;
}

.descripcion {
  line-height: 1.5;
}

/* Contenedor de controles */
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

.btn:hover {
  opacity: 0.7;
}

/* Input Range personalizado */
.rango-velocidad {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
}

input[type=range] {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 10px;
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 100%;
  background: #FFFFFF;
  cursor: pointer;
}

/* Resultados */
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

.tarjeta-algoritmo h3 {
  margin-bottom: 1.5rem;
}

.contenedor-svg {
  width: 100%;
  height: 250px;
  border-bottom: 1px solid #555;
  margin: 0 0 1.5rem 0;
}

.cronometro {
  padding: 0.4rem 1.2rem;
}

/* Media Queries */
/* TABLET */
@media (min-width: 768px) {
  .resultados-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* PC */
@media (min-width: 1024px) {
  .controles-rendimiento {
    flex-direction: row;
    justify-content: space-between;
  }

  .botones {
    flex-wrap: nowrap;
  }

  .rango-velocidad {
    width: 300px;
  }
}
</style>