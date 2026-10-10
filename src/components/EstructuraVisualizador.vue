<script setup>
defineProps({   // Este componente va a estar formado únicamente por el título referenciado en Rendimiento.vue
  titulo: {
    type: String,
    required: true
  },
  datos: {
    type: Array,
    required: true,
    default: () => [] // Por defecto llega como un arreglo vacío si aún no se ha generado
  }
});
</script>

<!-- Plantilla para cada tarjeta para visualizar el funcionamiento de los algoritmos-->
<template>
  <article class="tarjeta-algoritmo">
    <h3>{{ titulo }}</h3> <!-- Obtiene el título desde Rendimiento.vue -->
    <figure class="grafico">
      <div 
        v-for="(valor, index) in datos" 
        :key="index"
        class="barra"
        :style="{ height: valor + '%' }"
      ></div>    
    </figure>
    <time class="cronometro">00:00:00</time>
  </article>
</template>

<!-- Se definen los estilos de cada tarjeta -->
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
  margin-bottom: 1.5rem;
  color: #FFFFFF;
}

.grafico {
  width: 100%;
  height: 120px;
  border-bottom: 1px solid #555;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: flex-end; /* Alinea las barras desde la base hacia arriba */
  justify-content: center;
  gap: 4px; /* Espacio pequeño entre cada barra */
  padding: 0 10px;
}

.barra {
  width: 16px;
  background-color: #3B82F6; /* Un tono azulado como en tus mockups */
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  transition: height 0.2s ease; /* Animación suave cuando cambie de valor */
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