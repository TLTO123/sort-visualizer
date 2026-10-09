<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { renderizarBarras } from '../components/renderizarBarras.js';
import * as d3 from 'd3';

// Variable que simula el llenado azul de la barra de velocidad
const progresoVelocidad = ref(30);

// Lista reactiva que contendrá los números
const listaNumeros = ref([]);

// Creamos un array con los selectores para automatizar la creación
const selectores = ['#grafico-bubble', '#grafico-selection', '#grafico-quicksort', '#grafico-insertion'];
const configSVG = { alto: 250, margen: 15 };

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

const generarNuevaLista = () => {
  // Generando de manera aleatoria una lista de entre 10 y 40 números
  const cantidadElementos = Math.floor(Math.random() * (40 - 10 + 1)) + 10;
  
  const nuevoArreglo = [];
  for (let i = 0; i < cantidadElementos; i++) {
    // Genera un número aleatorio entre 10 y 100
    const valorAleatorio = Math.floor(Math.random() * (100 - 10 + 1)) + 10; 
    
    // Estructuramos cada dato con un ID único compatible con renderizarBarras.js
    nuevoArreglo.push({
      id: crypto.randomUUID(), 
      valor: valorAleatorio,
      estado: 'default'
    });
  }

  // Guardamos el nuevo set de datos en la variable reactiva
  listaNumeros.value = nuevoArreglo;

  // Mandamos a renderizar las barras de forma segura
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
        <button class="btn">Iniciar</button>
        <button class="btn">Pausar</button>
        <button class="btn">Reiniciar</button>
      </div>

      <div class="rango-velocidad">
        <label for="velocidad" class="lexend text-button">Velocidad</label>
        <input type="range" id="velocidad" min="1" max="100" v-model="progresoVelocidad"
          :style="{ background: `linear-gradient(to right, #1F3B8A ${progresoVelocidad}%, #484848 ${progresoVelocidad}%)` }">
      </div>
    </section>

    <section class="resultados-grid">
      <article class="tarjeta-algoritmo lexend">
        <h3 class="text-subtitle">Burbuja (Bidireccional)</h3>
        <div id="grafico-bubble" class="contenedor-svg"></div>
        <time class="cronometro text-button">00:00:00</time>
      </article>

      <article class="tarjeta-algoritmo lexend">
        <h3 class="text-subtitle">Ordenamiento por Selección</h3>
        <div id="grafico-selection" class="contenedor-svg"></div>
        <time class="cronometro text-button">00:00:00</time>
      </article>

      <article class="tarjeta-algoritmo lexend">
        <h3 class="text-subtitle">Ordenamiento por Inserción</h3>
        <div id="grafico-insertion" class="contenedor-svg"></div>
        <time class="cronometro text-button">00:00:00</time>
      </article>

      <article class="tarjeta-algoritmo lexend">
        <h3 class="text-subtitle">Quicksort (Ordenamiento rápido)</h3>
        <div id="grafico-quicksort" class="contenedor-svg"></div>
        <time class="cronometro text-button">00:00:00</time>
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