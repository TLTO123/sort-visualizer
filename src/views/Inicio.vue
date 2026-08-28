<script setup>
    
</script>

<template>
    <div class="container-main">
        <div class="intro">
            <h1 class="intro-title">Comprende los algoritmos de ordenamiento visualmente</h1>
            <h1>Una plataforma interactiva para ver, entender y comparar el <strong>comportamiento de las estructuras de datos en tiempo real.</strong></h1>
        </div>
        <div class="text-intro">
            <p>
                Bienvenido a SortVisualizer. Esta herramienta fue diseñada para transformar conceptos lógicos 
                abstractos en animaciones claras, intuitivas y dinámicas. Ya sea que estés dando tus primeros 
                pasos en la programación o quieras profundizar en la eficiencia de tu código, aquí podrás experimentar 
                de forma práctica cómo operan los algoritmos esenciales de las ciencias de la computación. Observa el 
                flujo de los datos paso a paso, ajusta la velocidad de ejecución y descubre exactamente qué ocurre detrás
                de cada intercambio.
            </p>
            <a href="http://"><strong>Ir a la prueba de rendimiento</strong></a>
        </div>
        <div class="charts"></div>
        <div class="cards">
            <div class="interactivo">
                <h3 class="sub-title">Interactivo</h3>
                <p>Toma el mando de la simulación ajustando la velocidad de las animaciones en tiempo real de lento a rápido 
                    para no perderte ningún detalle. Experimenta de forma directa generando arreglos aleatorios o introduciendo 
                    tus propias listas personalizadas de datos.
                </p>
            </div>
            <div class="educativo">
                <h3 class="sub-title">Educativo</h3>
                <p>
                    Toma el mando de la simulación ajustando la velocidad de las animaciones en tiempo real de lento a 
                    rápido para no perderte ningún detalle. Experimenta de forma directa generando arreglos aleatorios 
                    o introduciendo tus propias listas personalizadas de datos.
                </p>
            </div>
            <div class="medicion-real">
                <h3 class="sub-title">Medición Real</h3>
                <p>
                    Ve más allá de la teoría de la complejidad algorítmica analizando la eficiencia en un entorno práctico. 
                    La herramienta cuenta con cronómetros integrados de alta precisión que registran el tiempo de ejecución.
                </p>
            </div>
        </div>
    
    </div>

</template>

<style>
*{
    --color-base: #1E1E1E;
    color: #fff;
    --background-container: linear-gradient(
            to bottom, 
            var(--color-base), 
            color-mix(in srgb, var(--color-base) 95%, white)
        );
}

.intro, 
.text-intro, 
.charts, 
.cards{
        background:var(--background-container);
        padding-left: 5vw;
        padding-right: 5vw;
        display: flex;
}

.intro{
    padding-top: 4%;
    flex-direction: column;
    text-align: center;    
    .intro-title {
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 2px solid #ccc;
    }
}

.text-intro{
    flex-direction: column;
    padding: 5vw;
    align-items: center;
}
.cards{
    flex-direction: column;
}
</style>