<script setup>
</script>

<template>
    <div class="container-main">
        <div class="intro lexend">
            <h1 class="text-title mb-2">Comprende los algoritmos de ordenamiento visualmente</h1>
            <hr />
            <h1 class="m-2 text-subtitle">
                ¿Tienes alguna duda, sugerencia o comentario sobre SortVisualizer? Nos interesa conocer tu
                opinión y ayudarte en todo lo relacionado con la aplicación. Utiliza el formulario de contacto para
                enviarnos tus consultas, reportar inconvenientes o compartir ideas que contribuyan a mejorar la
                experiencia de todos los usuarios.
            </h1>
        </div>
        <div class="fondo-gradiente w-full py-6 px-4">
            <!-- Tarjeta contenedora -->
            <div
                class="max-w-4xl mx-auto bg-[#1e1e20] border-2 border-black rounded-3xl p-8 sm:p-10 text-white shadow-2xl">

                <!-- Formulario -->
                <form class="space-y-8">

                    <!-- Campo nombre -->
                    <div class="input-group space-y-3">
                        <label for="nombre" class="block text-button lexend text-gray-300">
                            Nombre
                        </label>

                        <input type="text" id="nombre" name="nombre" placeholder="" class="w-full bg-[#505052] border-2 border-black text-gray-100
                text-body lexend rounded-xl px-4 py-3
                focus:outline-none focus:ring-2 focus:ring-[#f1d374]
                transition">
                    </div>

                    <!-- Campo correo electrónico -->
                    <div class="input-group space-y-3">
                        <label for="correo" class="block text-button lexend text-gray-300">
                            Correo electrónico
                        </label>

                        <input type="email" id="correo" name="correo" placeholder="" class="w-full bg-[#505052] border-2 border-black text-gray-100
                text-body lexend rounded-xl px-4 py-3
                focus:outline-none focus:ring-2 focus:ring-[#f1d374]
                transition">
                    </div>

                    <!-- Campo mensaje -->
                    <div class="input-group space-y-3">
                        <label for="mensaje" class="block text-button lexend text-gray-300">
                            Mensaje
                        </label>

                        <textarea id="mensaje" name="mensaje" class="w-full h-32 bg-[#505052] border-2 border-black
                text-gray-100 text-body lexend rounded-xl p-4
                focus:outline-none focus:ring-2 focus:ring-[#f1d374]
                resize-none transition"></textarea>
                    </div>

                    <!-- Botón enviar -->
                    <div>
                        <button type="submit" class="bg-linear-to-r from-[#FDE68A] to-[#FFE77A]
                hover:from-[#f1d374] hover:to-[#e0c263]
                text-[#2A2A2A] lexend text-button
                px-10 py-3 rounded-xl
                transition-all duration-300 shadow-sm">
                            Enviar
                        </button>
                    </div>

                </form>

            </div>
        </div>

    </div>
</template>

<style>
hr{
    border: none;
    border-top: 2px solid #484848;
    margin-bottom: 1.5rem;
}
</style>