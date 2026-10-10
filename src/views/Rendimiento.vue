<script setup>
import { ref, computed } from 'vue';
import EstructuraVisualizador from '../components/EstructuraVisualizador.vue';

const progresoVelocidad = ref(30); 
const listaOriginal = ref([]);
const estaEjecutando = ref(false);
const estaPausado = ref(false);

// Referencias a los 4 componentes hijos para EstructuraVisualizador y poderlos controlar desde Rendimiento
const tarjetaBurbuja = ref(null);
const tarjetaSeleccion = ref(null);
const tarjetaInsercion = ref(null);
const tarjetaQuicksort = ref(null);

const velocidadMs = computed(() => 1010 - (progresoVelocidad.value * 10)); // Slider para la velocidad de simulación

const generarLista = () => {
  const valoresNuevos = [];
  for (let i = 0; i < 15; i++) {
    const numeroAleatorio = Math.floor(Math.random() * 90) + 10;
    valoresNuevos.push({ id: crypto.randomUUID(), valor: numeroAleatorio, estado: 'default' }); // crypyo.randomUUID es para identificar cada barra
  }   // Correctamente con D3, el valor es el nímero aleatorio generado para cada valor, el estado es para operar con la barra durante el ordenamiento
  listaOriginal.value = valoresNuevos; // Asigna los nuevos valores aleatorios al arreglo reactivo de vue para actualizar en tiempo real
  estaEjecutando.value = false;
  estaPausado.value = false;

  // Reiniciar cronómetros de todas las tarjetas al generar nueva lista
  tarjetaBurbuja.value?.reiniciarCronometro();
  tarjetaSeleccion.value?.reiniciarCronometro();
  tarjetaInsercion.value?.reiniciarCronometro();
  tarjetaQuicksort.value?.reiniciarCronometro();
};

const iniciarSimulacion = () => {
  if (listaOriginal.value.length === 0) {
    alert("Primero genera una lista aleatoria.");
    return;
  }
  estaEjecutando.value = true;
  estaPausado.value = false;

  // Disparar los cronómetros de todas las tarjetas al mismo tiempo
  tarjetaBurbuja.value?.iniciarCronometro();
  tarjetaSeleccion.value?.iniciarCronometro();
  tarjetaInsercion.value?.iniciarCronometro();
  tarjetaQuicksort.value?.iniciarCronometro();  
};

const pausarSimulacion = () => {
  if (!estaEjecutando.value) return;
  estaPausado.value = !estaPausado.value; // ALterna entre True o False al identificador de estado pausado

  if (estaPausado.value) {
    tarjetaBurbuja.value?.detenerCronometro();
    tarjetaSeleccion.value?.detenerCronometro();
    tarjetaInsercion.value?.detenerCronometro();
    tarjetaQuicksort.value?.detenerCronometro();
  } else {
    tarjetaBurbuja.value?.iniciarCronometro();
    tarjetaSeleccion.value?.iniciarCronometro();
    tarjetaInsercion.value?.iniciarCronometro();
    tarjetaQuicksort.value?.iniciarCronometro();
  }
};

const reiniciarSimulacion = () => {
  estaEjecutando.value = false;
  estaPausado.value = false;

  tarjetaBurbuja.value?.reiniciarCronometro();
  tarjetaSeleccion.value?.reiniciarCronometro();
  tarjetaInsercion.value?.reiniciarCronometro();
  tarjetaQuicksort.value?.reiniciarCronometro();

  // Opcional: regenerar o limpiar la lista base
  generarLista();
};
</script>

<template>
  <div class="contenedor">
    <header class="cabecera">
      <h2 class="subtitulo">Prueba de rendimiento (Demostración simultánea)</h2>
      <p class="descripcion">
        Compara el rendimiento de los diferentes algoritmos de ordenamiento mediante una simulación interactiva.
      </p>
    </header>

    <section class="controles-rendimiento">
      <div class="botones">
        <button class="btn" @click="generarLista">Generar nueva lista aleatoria</button>
        <button class="btn" @click="iniciarSimulacion" :disabled="estaEjecutando && !estaPausado">Iniciar</button>
        <button class="btn" @click="pausarSimulacion" :disabled="!estaEjecutando">
          {{ estaPausado ? 'Reanudar' : 'Pausar' }} <!-- Alterna el label del botón dependiendo si está pausado o no-->
        </button>
        <button class="btn" @click="reiniciarSimulacion">Reiniciar</button>
      </div>
      
      <div class="rango-velocidad">
        <label for="velocidad">Velocidad</label>
        <input 
          type="range" 
          id="velocidad" 
          min="1" 
          max="100" 
          v-model="progresoVelocidad"
          :style="{ background: `linear-gradient(to right, #1F3B8A ${progresoVelocidad}%, #484848 ${progresoVelocidad}%)` }">
      </div>
    </section>

    <section class="resultados-grid">
      <EstructuraVisualizador ref="tarjetaBurbuja" titulo="Burbuja (bidireccional)" :datos="listaOriginal" />
      <EstructuraVisualizador ref="tarjetaSeleccion" titulo="Ordenamiento por selección" :datos="listaOriginal" />
      <EstructuraVisualizador ref="tarjetaInsercion" titulo="Ordenamiento por inserción" :datos="listaOriginal" />
      <EstructuraVisualizador ref="tarjetaQuicksort" titulo="Quicksort (ordenamiento rápido)" :datos="listaOriginal" />
    </section>    
  </div>
</template>

<style scoped> /* scoped para que no afecte a los otros */
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
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.descripcion {
  font-size: 0.9rem;
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

.btn, .cronometro {
  background-color: #FCE67E;
  color: #000000;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  font-size: 0.85rem;
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
  font-size: 0.85rem;
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