<script setup>
</script>

<template>
    <section class="w-full fondo-gradiente text-white lexend py-7" aria-labelledby="titulo-principal" aria-describedby="desc-principal">
        <div class="max-w-2xl mx-auto px-4 text-center">
            <h1 class="text-title p-[0.3em] mt-1 text-wrap" id="titulo-principal">
                Panel de ordenamiento personalizado
            </h1>
            <hr class="w-full border-t-3 border-gray-400/60 mt-2 mb-4"/>
            <p class="text-wrap mt-2 mb-5" id="desc-principal">
                Ingresa una lista de valores, selecciona el algoritmo
                de ordenamiento de tu preferencia y <span
                    class="bg-linear-to-r from-[#ED9C71] to-[#F9DC8A] bg-clip-text text-transparent">visualiza paso a
                    paso
                    cómo se organiza la información.</span>
            </p>
        </div>
    </section>

    <section class="w-full py-6 px-4" aria-labelledby="titulo-config">

        <!-- Tarjeta contenedora -->
        <div
            class="max-w-4xl mx-auto bg-[#1e1e20] border-2 border-[#000000] rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6">

            <!-- Título principal -->
            <h2 id="titulo-config" class="text-center text-subtitle lexend text-gray-100">
                Configuración de datos
            </h2>

            <!-- Campo de entrada de valores -->
            <div class="input-group">
                <label for="values" class="sr-only">Ingrese los valores</label>
                <textarea id="values" name="values" aria-describedby="help-values"
                    placeholder="Ingrese los valores separados por comas"
                    class="w-full h-32 bg-[#444446] border-2 border-[#000000] text-gray-100 placeholder-gray-300 text-center rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#f1d374] resize-none text-body lexend flex items-center justify-center leading-loose"></textarea>
            </div>

            <!-- Selección de algoritmo -->
            <div class="input-group space-y-2">
                <label for="algoritmo" class="block text-button lexend text-gray-200 text-left">
                    Seleccionar método de ordenamiento
                </label>
                <div class="relative">
                    <select id="algoritmo" name="algoritmo"
                        class="w-full bg-[#444446] border-2 border-[#000000] text-gray-100 text-body lexend rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#f1d374] cursor-pointer pr-10">
                        <option value="bubble">Burbuja</option>
                        <option value="selection">Selección</option>
                        <option value="insertion">Inserción</option>
                        <option value="quicksort">Quicksort</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-300">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7">
                            </path>
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Botones de control y slider de velocidad -->
            <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div class="flex flex-wrap items-center gap-3">
                    <button type="button"
                        class="bg-[#FFE77A] hover:bg-[#e0c263] text-black lexend px-6 py-2 rounded-xl text-button transition-colors shadow-sm">
                        Iniciar
                    </button>
                    <button type="button"
                        class="bg-[#FFE77A] hover:bg-[#e0c263] text-black lexend px-6 py-2 rounded-xl text-button transition-colors shadow-sm">
                        Pausar
                    </button>
                    <button type="button"
                        class="bg-[#FFE77A] hover:bg-[#e0c263] text-black lexend px-6 py-2 rounded-xl text-button transition-colors shadow-sm">
                        Reiniciar
                    </button>
                </div>

                <!-- Deslizador de velocidad -->
                <div class="flex items-center gap-3 text-body lexend text-gray-200">
                    <label for="velocidad">Velocidad</label>
                    <input type="range" id="velocidad" min="1" max="100"
                        class="w-36 sm:w-48 h-2 bg-[#444446] rounded-lg appearance-none cursor-pointer accent-blue-600">
                </div>
            </div>

        </div>

    </section>

    <section class="fondo-gradiente w-full py-7" aria-labelledby="titulo-resultado">
        <h2 id="titulo-resultado" class="text-center text-white lexend text-subtitle">
            Resultado del ordenamiento
        </h2>
        <div class="max-w-4xl my-4 mx-auto bg-[#1e1e20] border-2 border-[#000000] rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6">
            <figure class="grafico">
                <!-- gráfico dinámico -->
            </figure>
            <time class="timer bg-[#FFE77A] text-black lexend px-6 py-2 rounded-xl text-button">
                00:00:00
            </time>
        </div>
    </section>
</template>

<style>
</style>