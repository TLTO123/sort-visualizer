<script setup>
import { ref } from 'vue';
import EstructuraVisualizador from '../components/EstructuraVisualizador.vue';

// Variable que simula el llenado azul de la barra de velocidad
const progresoVelocidad = ref(30); 

// Variable para almacenar los valores a ordenar inicialmente vacía 
const listaOriginal = ref([]);
// Función para generar números aleatorios
const generarLista = () => {
  const nuevaLista = [];
  const cantidadDeBarras = 25; // Cantidad de elementos a ordenar

  for (let i = 0; i < cantidadDeBarras; i++) {
    // Genera un número aleatorio entero entre 10 y 99
    const numeroAleatorio = Math.floor(Math.random() * 90) + 10;
    nuevaLista.push(numeroAleatorio);
  }

  // Guardamos la nueva lista en nuestra variable reactiva
  listaOriginal.value = nuevaLista;
  console.log("Lista generada:", listaOriginal.value); // Puedes abrir la consola del navegador (F12) para verla
};

</script>

<template>
  <div class="contenedor">
    <header class="cabecera">
      <h2 class="subtitulo">Prueba de rendimiento   (Demostración simultánea)</h2>
      <p class="descripcion">
        Compara el rendimiento de los diferentes algoritmos de ordenamiento mediante una simulación interactiva. 
        Genera un conjunto de datos, ajusta la velocidad de ejecución y observa el tiempo que tarda cada método 
        en completar el proceso.
      </p>
    </header>

    <section class="controles-rendimiento">
      <div class="botones">
        <button class="btn" @click ="generarLista">Generar nueva lista aleatoria</button>
        <button class="btn">Iniciar</button>
        <button class="btn">Pausar</button>
        <button class="btn">Reiniciar</button>
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
      <EstructuraVisualizador titulo="Burbuja (bidireccional)" :datos="listaOriginal"/>
      <EstructuraVisualizador titulo="Ordenamiento por selección" :datos="listaOriginal"/>
      <EstructuraVisualizador titulo="Ordenamiento por inserción" :datos="listaOriginal"/>
      <EstructuraVisualizador titulo="Quicksort (ordenamiento rápido)" :datos="listaOriginal"/>
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