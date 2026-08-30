<script setup>
import { onMounted } from 'vue';
import { graficaBarra } from '../components/charts'
import { RouterLink } from 'vue-router'


const etiquetas = ['', '', '', '', '', '', '', '', '', '', ''];
const valores = [45, 12, 28, 35, 25, 10, 5, 50, 40, 20, 15];

onMounted(() => {
    graficaBarra('grafica-barra', 'Métodos de ordenamiento', etiquetas, valores)
})

</script>

<template>
    <div class="container-main">
        <div class="intro">
            <h1 class="intro-title">Comprende los algoritmos de ordenamiento visualmente</h1>
            <h1 class="m-5">Una plataforma interactiva para ver, entender y comparar el <strong
                    class="font-bold from-pink-400 via-orange-400 to-yellow-400 bg-clip-text text-white">comportamiento
                    de las estructuras de datos en tiempo real.</strong></h1>
        </div>
        <div class="text-intro">
            <p class="m-5 font-mono">
                Bienvenido a SortVisualizer. Esta herramienta fue diseñada para transformar conceptos lógicos
                abstractos en animaciones claras, intuitivas y dinámicas. Ya sea que estés dando tus primeros
                pasos en la programación o quieras profundizar en la eficiencia de tu código, aquí podrás experimentar
                de forma práctica cómo operan los algoritmos esenciales de las ciencias de la computación. Observa el
                flujo de los datos paso a paso, ajusta la velocidad de ejecución y descubre exactamente qué ocurre
                detrás
                de cada intercambio.
            </p>
            <a class="btn-rendimiento p-2 mt-2">
                <router-link to="/rendimiento" class="font-black">Ir a la prueba de rendimiento</router-link>
            </a>

        </div>
        <div class="charts">
            <canvas id="grafica-barra" class="mt-3"></canvas>
        </div>
        <div class="cards pt-10 pb-10">
            <div class="interactivo mb-10 p-5">
                <h3 class="font-bold mb-2">Interactivo</h3>
                <p class="pl-4">Toma el mando de la simulación ajustando la velocidad de las animaciones en tiempo real
                    de lento a rápido
                    para no perderte ningún detalle. Experimenta de forma directa generando arreglos aleatorios o
                    introduciendo
                    tus propias listas personalizadas de datos.
                </p>
            </div>
            <div class="educativo mb-10 p-5">
                <h3 class="font-bold mb-2">Educativo</h3>
                <p class="pl-4">
                    Toma el mando de la simulación ajustando la velocidad de las animaciones en tiempo real de lento a
                    rápido para no perderte ningún detalle. Experimenta de forma directa generando arreglos aleatorios
                    o introduciendo tus propias listas personalizadas de datos.
                </p>
            </div>
            <div class="medicion-real mb-10 p-5">
                <h3 class="font-bold mb-2">Medición Real</h3>
                <p class="pl-4">
                    Ve más allá de la teoría de la complejidad algorítmica analizando la eficiencia en un entorno
                    práctico.
                    La herramienta cuenta con cronómetros integrados de alta precisión que registran el tiempo de
                    ejecución.
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

    .educativo,
    .interactivo,
    .medicion-real {
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
    border-radius: 5px;

}

.charts {
    display: flex;
    justify-content: center;

    #grafica-barra {
        height: 400px !important;
    }
}
</style>