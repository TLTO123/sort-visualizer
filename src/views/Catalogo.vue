<script setup>
const algoritmos = [
  {
    nombre: 'Burbuja (Bidireccional)',
    dificultad: 'Media',
    complejidad: 'O(n²)',
    porcentaje: 55,
    descripcion:
      'Este algoritmo recorre la lista en ambas direcciones, comparando elementos adyacentes e intercambiándolos cuando se encuentran en el orden incorrecto. El proceso se repite hasta que la lista queda completamente ordenada.'
  },
  {
    nombre: 'Ordenamiento por Selección',
    dificultad: 'Media',
    complejidad: 'O(n²)',
    porcentaje: 55,
    descripcion:
      'Busca el elemento más pequeño dentro de la parte no ordenada de la lista y lo coloca en su posición correspondiente. Este procedimiento continúa hasta ordenar todos los elementos.'
  },
  {
    nombre: 'Ordenamiento por Inserción',
    dificultad: 'Baja',
    complejidad: 'O(n²)',
    porcentaje: 40,
    descripcion:
      'Construye la lista ordenada de manera progresiva. Cada elemento se toma y se inserta en la posición correcta dentro de la parte de la lista que ya se encuentra ordenada.'
  },
  {
    nombre: 'Quicksort (Ordenamiento rápido)',
    dificultad: 'Alta',
    complejidad: 'O(n log n)',
    porcentaje: 75,
    descripcion:
      'Divide la lista utilizando un elemento como pivote. Los valores menores se colocan a un lado y los mayores al otro, repitiendo el proceso hasta obtener la lista completamente ordenada.'
  }
]
</script>

<template>
  <section class="catalogo">
    <!-- Introducción -->
    <div class="catalogo-intro">
      <h1 class="lexend text-title">Métodos de ordenamiento</h1>

      <hr />

      <p class="mono text-body">
        Estos algoritmos permiten organizar conjuntos de datos siguiendo
        diferentes estrategias. Cada método posee características propias,
        niveles de dificultad y comportamientos distintos dependiendo de la
        cantidad y distribución de los datos.
      </p>

      <p class="mono text-body">
        Explora cada método para conocer de forma general cómo funciona y
        comparar su complejidad.
      </p>
    </div>

    <!-- Tarjetas -->
    <div class="algoritmos-grid">
      <article
        v-for="algoritmo in algoritmos"
        :key="algoritmo.nombre"
        class="algoritmo-card"
      >
        <div class="algoritmo-header">
          <!-- Icono -->
          <div class="algoritmo-icono">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M4 18V9" />
              <path d="M8 18V5" />
              <path d="M12 18v-7" />
              <path d="M16 18V3" />
              <path d="M20 18v-4" />
            </svg>
          </div>

          <h2 class="lexend text-subtitle">
            {{ algoritmo.nombre }}
          </h2>
        </div>

        <p class="descripcion mono text-body">
          {{ algoritmo.descripcion }}
        </p>

        <div class="datos lexend">
          <div class="dato">
            <span>Dificultad</span>
            <strong>{{ algoritmo.dificultad }}</strong>
          </div>

          <div class="barra">
            <div
              class="barra-progreso"
              :style="{ width: algoritmo.porcentaje + '%' }"
            ></div>
          </div>

          <div class="dato complejidad lexend">
            <span>Complejidad</span>
            <strong>{{ algoritmo.complejidad }}</strong>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.catalogo {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1e1e1e, #242424);
  color: white;
  padding: 2rem 1rem 3rem;
}

.catalogo-intro {
  max-width: 1050px;
  margin: 0 auto 2rem;
  text-align: center;
}

.catalogo-intro h1 {
  margin-bottom: 1rem;
}

.catalogo-intro hr {
  border: none;
  border-top: 2px solid #484848;
  margin-bottom: 1.5rem;
}

.catalogo-intro p {
  max-width: 950px;
  margin: 0 auto 1rem;
  line-height: 1.6;
}

.algoritmos-grid {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.algoritmo-card {
  background-color: #272727;
  border: 1px solid #484848;
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.algoritmo-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.algoritmo-icono {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border: 2px solid #ffe77a;
  color: #ffe77a;
  border-radius: 50%;
  padding: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.algoritmo-icono svg {
  width: 100%;
  height: 100%;
}

.descripcion {
  line-height: 1.6;
  flex-grow: 1;
  margin-bottom: 1.5rem;
}

.datos {
  margin-top: auto;
}

.dato {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.dato strong {
  color: #ffe77a;
}

.barra {
  height: 6px;
  width: 100%;
  background-color: #484848;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.barra-progreso {
  height: 100%;
  background-color: #19356c;
  border-radius: 10px;
}

.complejidad {
  margin-bottom: 0;
}

/* Tablet */
@media (min-width: 768px) {
  .catalogo {
    padding: 2.5rem 2rem 4rem;
  }

  .algoritmos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* PC */
@media (min-width: 1200px) {
  .catalogo {
    padding-left: 5vw;
    padding-right: 5vw;
  }

  .algoritmo-card {
    padding: 2rem;
  }
}
</style>