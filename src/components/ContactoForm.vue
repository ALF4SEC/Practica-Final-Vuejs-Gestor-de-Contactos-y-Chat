<template>
  <div class="p-4">
    <Card>
      <template #title>
        <div class="flex align-items-center gap-2">
          <Button 
            icon="pi pi-arrow-left" 
            @click="volver"
            text
            rounded
            v-tooltip.right="'Volver al listado'"
          />
          <i :class="esEdicion ? 'pi pi-pencil' : 'pi pi-plus-circle'"></i>
          <span>{{ esEdicion ? 'Editar Contacto' : 'Nuevo Contacto' }}</span>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="guardarContacto">
          <div class="grid">
            <div class="col-12 md:col-6">
              <label for="nombre">
                <i class="pi pi-user"></i>
                Nombre *
              </label>
              <InputText 
                id="nombre"
                v-model="formulario.nombre"
                :class="{ 'p-invalid': errores.nombre }"
                placeholder="Ej: Juan Pérez"
                class="w-full"
                @blur="validarCampoNombre"
              />
              <small v-if="errores.nombre" class="p-error">{{ errores.nombre }}</small>
            </div>

            <div class="col-12 md:col-6">
              <label for="email">
                <i class="pi pi-envelope"></i>
                Email *
              </label>
              <InputText 
                id="email"
                v-model="formulario.email"
                type="email"
                :class="{ 'p-invalid': errores.email }"
                placeholder="Ej: juan@ejemplo.com"
                class="w-full"
                @blur="validarCampoEmail"
              />
              <small v-if="errores.email" class="p-error">{{ errores.email }}</small>
            </div>

            <div class="col-12 md:col-6">
              <label for="telefono">
                <i class="pi pi-phone"></i>
                Teléfono
              </label>
              <InputText 
                id="telefono"
                v-model="formulario.telefono"
                placeholder="Ej: +34 666 123 456"
                class="w-full"
                :class="{ 'p-invalid': errores.telefono }"
                @blur="validarCampoTelefono"
              />
              <small v-if="errores.telefono" class="p-error">{{ errores.telefono }}</small>
            </div>

            <div class="col-12 md:col-6">
              <label for="empresa">
                <i class="pi pi-building"></i>
                Empresa
              </label>
              <InputText 
                id="empresa"
                v-model="formulario.empresa"
                placeholder="Ej: Tech Solutions"
                class="w-full"
              />
            </div>

            <div class="col-12 md:col-6">
              <label for="estado">
                <i class="pi pi-info-circle"></i>
                Estado
              </label>
              <Dropdown 
                id="estado"
                v-model="formulario.estado"
                :options="opcionesEstado"
                placeholder="Seleccione un estado"
                class="w-full"
              />
            </div>

            <div class="col-12">
              <div class="flex align-items-center gap-2">
                <Checkbox 
                  id="favorito"
                  v-model="formulario.favorito"
                  :binary="true"
                />
                <label for="favorito" class="ml-2">
                  <i class="pi pi-star-fill" style="color: #fbbf24;"></i>
                  Marcar como favorito
                </label>
              </div>
            </div>
          </div>

          <Message severity="info" :closable="false" class="mt-3">
            Los campos marcados con * son obligatorios
          </Message>

          <div class="flex gap-2 justify-content-end mt-3">
            <Button 
              label="Cancelar" 
              icon="pi pi-times"
              severity="secondary" 
              @click="volver"
              type="button"
              outlined
            />
            <Button 
              :label="esEdicion ? 'Actualizar' : 'Crear Contacto'" 
              :icon="esEdicion ? 'pi pi-check' : 'pi pi-plus'"
              type="submit"
              :disabled="!isFormValid"
            />
          </div>
        </form>
      </template>
    </Card>

    <Toast />
  </div>
</template>

<script setup>
import Button from 'primevue/button'
import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContactosStore } from '../stores/contactosStore'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const store = useContactosStore()

const formulario = ref({
  nombre: '',
  email: '',
  telefono: '',
  empresa: '',
  estado: 'Activo',
  favorito: false
})

const errores = ref({
  nombre: '',
  email: '',
  telefono: '' // NUEVO: validación de teléfono
})

const opcionesEstado = ['Activo', 'Inactivo']

const esEdicion = computed(() => !!route.params.id)

// NUEVO: Validación en tiempo real - computed para deshabilitar botón submit
const isFormValid = computed(() => {
  return formulario.value.nombre.trim() !== '' && 
         formulario.value.email.trim() !== '' &&
         validarEmail(formulario.value.email) &&
         !errores.value.nombre &&
         !errores.value.email
})

onMounted(() => {
  if (esEdicion.value) {
    cargarContacto()
  }
})

const cargarContacto = () => {
  const contacto = store.obtenerContactoPorId(route.params.id)
  
  if (!contacto) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Contacto no encontrado',
      life: 3000
    })
    router.push('/contactos')
    return
  }

  formulario.value = {
    nombre: contacto.nombre,
    email: contacto.email,
    telefono: contacto.telefono || '',
    empresa: contacto.empresa || '',
    estado: contacto.estado,
    favorito: contacto.favorito
  }
}

const validarFormulario = () => {
  errores.value = {
    nombre: '',
    email: '',
    telefono: ''
  }

  let esValido = true

  if (!formulario.value.nombre.trim()) {
    errores.value.nombre = 'El nombre es obligatorio'
    esValido = false
  }

  if (!formulario.value.email.trim()) {
    errores.value.email = 'El email es obligatorio'
    esValido = false
  } else if (!validarEmail(formulario.value.email)) {
    errores.value.email = 'El email no es válido'
    esValido = false
  }

  // NUEVO: Validación de teléfono (si está presente)
  if (formulario.value.telefono && !validarTelefono(formulario.value.telefono)) {
    errores.value.telefono = 'El teléfono debe contener solo dígitos, espacios, +, -, ( )'
    esValido = false
  }

  return esValido
}

const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// NUEVO: Validar formato de teléfono
const validarTelefono = (telefono) => {
  // Permitir dígitos, espacios, +, -, paréntesis
  const regex = /^[\d\s+\-()]+$/
  return regex.test(telefono)
}

// NUEVO: Normalizar teléfono (trim y colapsar espacios)
const normalizarTelefono = (telefono) => {
  if (!telefono) return ''
  return telefono.trim().replace(/\s+/g, ' ')
}

// NUEVO: Validación en tiempo real al perder el foco
const validarCampoNombre = () => {
  if (!formulario.value.nombre.trim()) {
    errores.value.nombre = 'El nombre es obligatorio'
  } else {
    errores.value.nombre = ''
  }
}

const validarCampoEmail = () => {
  if (!formulario.value.email.trim()) {
    errores.value.email = 'El email es obligatorio'
  } else if (!validarEmail(formulario.value.email)) {
    errores.value.email = 'El email no es válido'
  } else {
    errores.value.email = ''
  }
}

const validarCampoTelefono = () => {
  if (formulario.value.telefono && !validarTelefono(formulario.value.telefono)) {
    errores.value.telefono = 'El teléfono debe contener solo dígitos, espacios, +, -, ( )'
  } else {
    errores.value.telefono = ''
    // Normalizar el teléfono
    formulario.value.telefono = normalizarTelefono(formulario.value.telefono)
  }
}

const guardarContacto = async () => {
  if (!validarFormulario()) return

  // Normalizar teléfono antes de guardar
  formulario.value.telefono = normalizarTelefono(formulario.value.telefono)

  try {
    if (esEdicion.value) {
      await store.actualizarContacto(route.params.id, formulario.value)
      
      toast.add({
        severity: 'success',
        summary: 'Contacto actualizado',
        detail: 'El contacto ha sido actualizado correctamente',
        life: 3000
      })
      router.push('/contactos')
    } else {
      const nuevoContacto = await store.crearContacto(formulario.value)
      
      toast.add({
        severity: 'success',
        summary: 'Contacto creado',
        detail: `El contacto "${nuevoContacto.nombre}" ha sido creado correctamente`,
        life: 3000
      })
      router.push('/contactos')
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo guardar el contacto',
      life: 3000
    })
  }
}

const volver = () => {
  router.push('/contactos')
}
</script>
