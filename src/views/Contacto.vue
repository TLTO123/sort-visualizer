<script setup>
</script>

<template>
    <div class="container-main">
        <div class="intro">
            <h1 class="intro-title">Comprende los algoritmos de ordenamiento visualmente</h1>
            <h1 class="m-5">
                ¿Tienes alguna duda, sugerencia o comentario sobre SortVisualizer? Nos interesa conocer tu
                opinión y ayudarte en todo lo relacionado con la aplicación. Utiliza el formulario de contacto para
                enviarnos tus consultas, reportar inconvenientes o compartir ideas que contribuyan a mejorar la
                experiencia de todos los usuarios.
            </h1>
        </div>
        <div
            class="
            container-form-contacto p-5 [--color-base:#1E1E1E] 
            text-white bg-[linear-gradient(to_bottom,var(--color-base),color-mix(in_srgb,var(--color-base)_95%,white))] 
            px-[5vw] flex ">
            <form class="bg-[#272727] rounded border border-black w-full">
                <div class="form">
                    <label for="txtNombre">Nombre</label>
                    <input class="bg-[#484848] border border-black rounded" type="text" name="txtNombre" id="txtNombre">

                    <label for="txtEmail">Correo electrónico</label>
                    <input class="bg-[#484848] border border-black rounded" type="email" name="txtEmail" id="txtEmail">

                    <label for="txtMensaje">Mensaje</label>
                    <textarea class="bg-[#484848] border border-black rounded" name="txtMensaje" id="txtMensaje"></textarea>

                </div>

                <button type="submit" class="cursor-pointer bg-[#FFE77A] pt-2 pb-2 pl-3 pr-3 rounded text-black font-bold">Enviar</button>
            </form>
        </div>

    </div>
</template>

<style>

</style>