<script setup>
const desarrolladores = [
  {
    nombre: 'Alex Mauricio Alvarado Cantarero',
    iniciales: 'AA'
  },
  {
    nombre: 'Alex Gabriel Araujo Sol',
    iniciales: 'AS'
  },
  {
    nombre: 'Billy Seth Cañas Palacios',
    iniciales: 'BC'
  },
  {
    nombre: 'Cristian Fernando Mena Navarro',
    iniciales: 'CM'
  }
]
</script>

<template>
  <section class="desarrolladores">
    <!-- Presentación -->
    <div class="equipo-intro">
      <h1 class="lexend text-title">Nuestro equipo</h1>

      <hr />

      <p class="mono text-body">
        SortVisualizer es el resultado del trabajo colaborativo de un equipo de
        desarrolladores comprometidos con la creación de una herramienta
        educativa e interactiva para facilitar la comprensión de los algoritmos
        de ordenamiento.
      </p>

      <p class="mono text-body">
        A continuación, conoce a los integrantes que hicieron posible este
        proyecto.
      </p>
    </div>

    <!-- Miembros -->
    <div class="equipo-grid">
      <article
        v-for="desarrollador in desarrolladores"
        :key="desarrollador.nombre"
        class="desarrollador-card"
      >
        <div class="avatar">
          <!-- Mientras no tengan fotografías usamos iniciales -->
          <span class="lexend">{{ desarrollador.iniciales }}</span>
        </div>

        <div class="informacion">
          <h2 class="lexend text-subtitle">
            {{ desarrollador.nombre }}
          </h2>

          <p class="mono text-body">
            Integrante del equipo de desarrollo de SortVisualizer, participando
            en la construcción de una herramienta orientada al aprendizaje y
            visualización de algoritmos de ordenamiento.
          </p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.desarrolladores {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1e1e1e, #242424);
  color: #ffffff;
  padding: 2rem 1rem 3rem;
}

.equipo-intro {
  max-width: 1050px;
  margin: 0 auto 2.5rem;
  text-align: center;
}

.equipo-intro h1 {
  margin-bottom: 1rem;
}

.equipo-intro hr {
  border: none;
  border-top: 2px solid #484848;
  margin-bottom: 1.5rem;
}

.equipo-intro p {
  max-width: 950px;
  margin: 0 auto 1rem;
  line-height: 1.6;
}

.equipo-grid {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.desarrollador-card {
  background-color: #272727;
  border: 1px solid #484848;
  border-radius: 15px;
  padding: 1.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.3rem;
}

.avatar {
  width: 100px;
  height: 100px;
  min-width: 100px;

  border-radius: 50%;
  border: 3px solid #ffe77a;

  background-color: #1e1e1e;

  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar span {
  color: #ffe77a;
  font-size: 1.5rem;
  font-weight: 600;
}

.informacion h2 {
  margin-bottom: 1rem;
}

.informacion p {
  line-height: 1.6;
}

/* Tablet */
@media (min-width: 768px) {
  .desarrolladores {
    padding: 2.5rem 2rem 4rem;
  }

  .equipo-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .desarrollador-card {
    min-height: 290px;
  }
}

/* PC */
@media (min-width: 1200px) {
  .desarrolladores {
    padding-left: 5vw;
    padding-right: 5vw;
  }

  .desarrollador-card {
    flex-direction: row;
    text-align: left;
    padding: 2rem;
  }

  .avatar {
    width: 115px;
    height: 115px;
    min-width: 115px;
  }
}
</style>