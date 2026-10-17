<script setup>
// ============================================================
// ARCHIVO: views/Contacto.vue
// RESPONSABLE: formulario de contacto
// SERVICIO: EmailJS — envía el correo REAL vía su API REST, sin backend propio.
// FLUJO: submit → emailjs.sendForm(serviceID, templateID, form, publicKey)
//        → try: alert de éxito + form.reset() · catch: alert de error
// NOTAS DE SEGURIDAD: la Public Key está diseñada para exponerse en cliente;
//   no hay datos sensibles ni almacenamiento propio.
// ============================================================

import { ref } from 'vue';
import emailjs from '@emailjs/browser';

// Referencia al formulario para que EmailJS pueda extraer los datos
const formRef = ref(null);
const cargando = ref(false);

const enviarCorreo = async () => {
    cargando.value = true;

    try {
        // Credenciales reales de EmailJS
        const resultado = await emailjs.sendForm(
            'service_gsawmym',   // Service ID
            'template_3jac87v',  // Template ID
            formRef.value,
            'SsmvE_yIkVSB2cWYj'    // Public Key
        );

        console.log('Éxito:', resultado.text);
        alert('Mensaje enviado correctamente. ¡Gracias por tu retroalimentación!');
        
        // Limpia el formulario después de enviarlo con éxito
        formRef.value.reset(); 

    } catch (error) {
        console.error('Error al enviar:', error.text);
        alert('Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.');
    } finally {
        cargando.value = false;
    }
};
</script>

<template>
    <div class="container-main">
        <div class="intro">
            <h1 class="text-title mb-2 lexend">Comprende los algoritmos de ordenamiento visualmente</h1>
            <hr />
            <h1 class="m-2 text-subtitle mono">
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

                <!-- Formulario conectado a EmailJS -->
                <form ref="formRef" @submit.prevent="enviarCorreo" class="space-y-8">

                    <!-- Campo oculto para la variable {{title}} -->
                    <input type="hidden" name="title" value="Nuevo contacto desde SortVisualizer">

                    <!-- Campo nombre -->
                    <div class="input-group space-y-3">
                        <label for="nombre" class="block text-button lexend text-gray-300">
                            Nombre
                        </label>

                        <!-- IMPORTANTE: name="name" para coincidir con {{name}} en EmailJS -->
                        <input type="text" id="nombre" name="name" required placeholder="" class="w-full bg-[#505052] border-2 border-black text-gray-100
                text-body lexend rounded-xl px-4 py-3
                focus:outline-none focus:ring-2 focus:ring-[#f1d374]
                transition">
                    </div>

                    <!-- Campo correo electrónico -->
                    <div class="input-group space-y-3">
                        <label for="correo" class="block text-button lexend text-gray-300">
                            Correo electrónico
                        </label>

                        <!-- IMPORTANTE: name="email" para coincidir con {{email}} en EmailJS -->
                        <input type="email" id="correo" name="email" required placeholder="" class="w-full bg-[#505052] border-2 border-black text-gray-100
                text-body lexend rounded-xl px-4 py-3
                focus:outline-none focus:ring-2 focus:ring-[#f1d374]
                transition">
                    </div>

                    <!-- Campo mensaje -->
                    <div class="input-group space-y-3">
                        <label for="mensaje" class="block text-button lexend text-gray-300">
                            Mensaje
                        </label>

                        <!-- IMPORTANTE: name="message" para coincidir con {{message}} en EmailJS -->
                        <textarea id="mensaje" name="message" required class="w-full h-32 bg-[#505052] border-2 border-black
                text-gray-100 text-body lexend rounded-xl p-4
                focus:outline-none focus:ring-2 focus:ring-[#f1d374]
                resize-none transition"></textarea>
                    </div>

                    <!-- Botón enviar -->
                    <div>
                        <button type="submit" :disabled="cargando" class="bg-linear-to-r from-[#FDE68A] to-[#FFE77A]
                hover:from-[#f1d374] hover:to-[#e0c263]
                text-[#2A2A2A] lexend text-button
                px-10 py-3 rounded-xl
                transition-all duration-300 shadow-sm
                disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ cargando ? 'Enviando...' : 'Enviar' }}
                        </button>
                    </div>

                </form>

            </div>
        </div>

    </div>
</template>

<style>
hr {
    border: none;
    border-top: 2px solid #484848;
    margin-bottom: 1.5rem;
}
</style>