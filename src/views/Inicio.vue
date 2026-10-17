<script setup>
// ============================================================
// ARCHIVO: views/Inicio.vue
// RESPONSABLE: portada del sitio
// QUÉ HACE: 1) carga las tarjetas "Interactivo/Educativo/Medición"
//              desde contenido.json (Criterio 2);
//           2) anima un fondo de barras con D3 (decorativo, Math.random).
// ============================================================

import { ref, onMounted, onUnmounted } from 'vue';
import { useApi } from '../composables/useApi';
import * as d3 from 'd3';

// Contenido dinámico de las tarjetas (JSON → estados cargando/error)
const { datos, cargando, error, cargar } = useApi('contenido');
const contenedorHero = ref(null); // ref al <div> donde D3 inserta el <svg>
let intervaloAnimacion = null; // handle del setInterval (se limpia al desmontar)

onMounted(cargar); // pide contenido.json al montar
onMounted(() => {
    // --- ANIMACIÓN DECORATIVA DEL HERO (a través de D3) --
    const ancho = contenedorHero.value.clientWidth || window.innerWidth * 0.9;
    const alto = 400;

    const cantidadBarras = Math.floor(ancho / 30);
    // Ojo: este 'datos' es local y "tapa" al 'datos' del composable (línea 15);
    // aquí solo se usa para la animación decorativa del fondo
    const datos = Array.from({ length: cantidadBarras }, (_, i) => ({
        id: i,
        valor: Math.random() * 100
    }));

    const svg = d3.select(contenedorHero.value)
        .append("svg")
        .attr("width", "100%")
        .attr("height", alto);

    const escalaY = d3.scaleLinear().domain([0, 100]).range([0, alto - 20]);

    const animarFondo = (data, duracion) => {
        const anchoBarra = ancho / data.length;
        const barras = svg.selectAll("rect.barra-hero").data(data, d => d.id);

        barras.enter()
            .append("rect")
            .attr("class", "barra-hero")
            .attr("x", (d, i) => i * anchoBarra + 4)
            .attr("y", alto)
            .attr("width", Math.max(1, anchoBarra - 8))
            .attr("height", 0)
            .attr("rx", 6)
            .attr("ry", 6)
            .attr("fill", "#374151") 
            .merge(barras)
            .transition()
            .duration(duracion)
            .ease(d3.easeSinInOut)
            .attr("y", d => alto - escalaY(d.valor))
            .attr("height", d => escalaY(d.valor))
            // Colores decorativos según el valor aleatorio de cada barra
            // (ojo: no tienen nada que ver con los estados 'comparando'/'minimo'
            // de los algoritmos, aquí solo importa el número que salga)
            .attr("fill", d => {
                if (d.valor > 80) return '#FFB3BA'; // valor alto → rosa
                if (d.valor > 50) return '#7DD3FC'; // valor medio-alto → azul
                if (d.valor > 20) return '#374151'; // valor medio → gris oscuro
                return '#4B5563';                   // valor bajo → gris (más claro que el anterior)
            });
    };

    animarFondo(datos, 800);

    // nueva "foto" cada 2 s
    intervaloAnimacion = setInterval(() => {
        const nuevosDatos = datos.map(d => ({
            ...d,
            valor: Math.random() * 100
        }));
        animarFondo(nuevosDatos, 1500);
    }, 2000);
});

// LIMPIEZA OBLIGATORIA: sin esto, el intervalo sobreviviría al componente
// y escribiría en un DOM ya destruido (fuga de memoria).
onUnmounted(() => {
    if (intervaloAnimacion) {
        clearInterval(intervaloAnimacion);
    }
});

</script>

<template>
    <div class="container-main">
        <div class="intro">
            <h1 class="intro-title text-title lexend">Comprende los algoritmos de ordenamiento visualmente</h1>
            <h1 class="m-5 lexend text-subtitle">Una plataforma interactiva para ver, entender y comparar el <span class="bg-linear-to-r from-[#ED9C71] to-[#F9DC8A] bg-clip-text text-transparent">comportamiento de las</span> <span class="bg-linear-to-r from-[#3BA4B3] to-[#40D3E1] bg-clip-text text-transparent">estructuras de datos en tiempo real.</span></h1>
        </div>
        <div class="text-intro">
            <p class="m-5 text-subtitle mono">
                Bienvenido a SortVisualizer. Esta herramienta fue diseñada para transformar conceptos lógicos
                abstractos en animaciones claras, intuitivas y dinámicas. Ya sea que estés dando tus primeros
                pasos en la programación o quieras profundizar en la eficiencia de tu código, aquí podrás experimentar
                de forma práctica cómo operan los algoritmos esenciales de las ciencias de la computación. Observa el
                flujo de los datos paso a paso, ajusta la velocidad de ejecución y descubre exactamente qué ocurre
                detrás
                de cada intercambio.
            </p>
            <a class="btn-rendimiento p-2 mt-2">
                <router-link to="/rendimiento" class="font-black lexend text-button">Ir a la prueba de rendimiento</router-link>
            </a>

        </div>
        <div class="charts">
            <div ref="contenedorHero" id="grafica-barra" class="mt-3 w-full opacity-60 pointer-events-none overflow-hidden mask-fade-out"></div>
        </div>
        <!-- Tres estados mutuamente excluyentes de la carga del JSON -->
        <p v-if="cargando" class="mono text-body">Cargando algoritmos...</p>
        <p v-else-if="error" class="mono text-body">
        No se pudo cargar el contenido. <button @click="cargar">Reintentar</button>
        </p>
        <div class="cards pt-10 pb-10">
            <div v-for="contenido in datos"
        :key="contenido.id" class="metodos-ordenamiento mb-10 p-5">
                <h3 class="mb-2 lexend text-subtitle">
                    {{ contenido.titulo }}
                </h3>
                <p class="pl-4 mono text-body">
                    {{ contenido.texto }}
                </p>
            </div>
        </div>

    </div>

</template>

<style>
.intro,
.text-intro,
.charts,
.cards {
    --color-base: #1E1E1E;
    color: #fff;
    --background-container: linear-gradient(to bottom,
            var(--color-base),
            color-mix(in srgb, var(--color-base) 95%, white));
    background: var(--background-container);
    padding-left: 5vw;
    padding-right: 5vw;
    display: flex;
}

.intro {
    padding-top: 4%;
    flex-direction: column;
    text-align: center;
    gap: 15%;

    .intro-title {

        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 2px solid #ccc;
    }
}

.text-intro {
    flex-direction: column;
    padding: 5vw;
    align-items: center;
    gap: 15%;
}

.cards {
    flex-direction: column;

    .metodos-ordenamiento {
        background-color: #272727;
        border: #484848 solid 1px;
        border-radius: 15px;
    }

    p {
        border-left: #FFE77A solid 1px;
    }
}

.font-black {
    color: black !important;
}

.btn-rendimiento {
    background-color: #FFE77A;
    border-radius: 10px;

}

/* .charts: sección de la gráfica decorativa */
.charts {
    display: flex;
    justify-content: center;

    #grafica-barra {
        height: 400px !important; /* el SVG de D3 necesita altura explícita */
    }
}

/* Efecto de degradado para que las barras se desvanezcan estéticamente en la parte superior */
.mask-fade-out {
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%);
}
</style>