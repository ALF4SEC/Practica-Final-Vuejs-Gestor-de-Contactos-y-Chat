<template>
  <div class="p-4">
    <Card v-if="contacto">
      <template #title>
        <div class="flex align-items-center gap-2">
          <Button 
            icon="pi pi-arrow-left" 
            @click="volver"
            text
            rounded
          />
          <span>Detalle del Contacto</span>
        </div>
      </template>
      <template #content>
        <div class="flex flex-column gap-4">
          <!-- Avatar con iniciales y nombre -->
          <div class="flex justify-content-between align-items-center">
            <div class="flex align-items-center gap-3">
              <div class="flex align-items-center justify-content-center border-circle bg-primary text-white font-bold text-2xl" 
                   style="width: 60px; height: 60px;">
                {{ getIniciales() }}
              </div>
              <h2 class="m-0">{{ contacto.nombre }}</h2>
            </div>
            <Button 
              :icon="contacto.favorito ? 'pi pi-star-fill' : 'pi pi-star'" 
              :label="contacto.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'"
              @click="toggleFavoritoContacto"
              :severity="contacto.favorito ? 'warning' : 'secondary'"
              outlined
            />
          </div>

          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="flex flex-column gap-2">
                <label class="font-semibold text-600">Email</label>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-envelope"></i>
                  <span>{{ contacto.email }}</span>
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="flex flex-column gap-2">
                <label class="font-semibold text-600">Teléfono</label>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-phone"></i>
                  <span>{{ contacto.telefono || 'No especificado' }}</span>
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="flex flex-column gap-2">
                <label class="font-semibold text-600">Empresa</label>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-building"></i>
                  <span>{{ contacto.empresa || 'No especificada' }}</span>
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="flex flex-column gap-2">
                <label class="font-semibold text-600">Estado</label>
                <Tag 
                  :value="contacto.estado" 
                  :severity="contacto.estado === 'Activo' ? 'success' : 'danger'"
                />
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="flex flex-column gap-2">
                <label class="font-semibold text-600">Favorito</label>
                <div class="flex align-items-center gap-2">
                  <i 
                    :class="contacto.favorito ? 'pi pi-star-fill' : 'pi pi-star'"
                    style="color: #fbbf24; font-size: 1.2rem;"
                  ></i>
                  <span>{{ contacto.favorito ? 'Sí' : 'No' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- NUEVO: Sección de detección de usuario registrado y chat -->
          <div v-if="checkingUser || usuarioRegistrado !== null" class="border-top-1 border-200 pt-4">
            <div v-if="checkingUser" class="flex align-items-center gap-2">
              <i class="pi pi-spin pi-spinner"></i>
              <span>Verificando si el contacto está registrado...</span>
            </div>
            
            <div v-else-if="usuarioRegistrado">
              <div class="flex flex-column gap-3">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-check-circle" style="color: var(--green-500); font-size: 1.2rem;"></i>
                  <span class="font-semibold">Este contacto está registrado en la aplicación</span>
                </div>
                <Button 
                  label="Abrir Chat" 
                  icon="pi pi-comments"
                  severity="success"
                  @click="abrirChat"
                  outlined
                />
              </div>
            </div>
            
            <div v-else>
              <div class="flex flex-column gap-3">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-info-circle" style="color: var(--blue-500); font-size: 1.2rem;"></i>
                  <span>Este contacto no está registrado en la aplicación</span>
                </div>
                <Button 
                  label="Invitar por Email" 
                  icon="pi pi-envelope"
                  severity="info"
                  @click="invitarContacto"
                  outlined
                />
              </div>
            </div>
          </div>

          <div class="flex gap-2 justify-content-end pt-4 border-top-1 border-200">
            <Button 
              label="Volver" 
              severity="secondary" 
              @click="volver"
              icon="pi pi-arrow-left"
              aria-label="Volver al listado de contactos"
            />
            <Button 
              label="Editar" 
              severity="warning" 
              @click="editar"
              icon="pi pi-pencil"
              :aria-label="`Editar contacto ${contacto.nombre}`"
            />
            <Button 
              label="Eliminar" 
              severity="danger" 
              @click="confirmarEliminar"
              icon="pi pi-trash"
              :aria-label="`Eliminar contacto ${contacto.nombre}`"
            />
          </div>
        </div>
      </template>
    </Card>

    <Card v-else>
      <template #content>
        <div class="text-center">
          <i class="pi pi-exclamation-triangle" style="font-size: 3rem; color: var(--red-500);"></i>
          <h3>Contacto no encontrado</h3>
          <Button 
            label="Volver al listado" 
            @click="volver"
            icon="pi pi-arrow-left"
          />
        </div>
      </template>
    </Card>

    <ConfirmDialog></ConfirmDialog>
    <Toast />
  </div>
</template>

<script setup>
import Button from 'primevue/button'
import Card from 'primevue/card'
import ConfirmDialog from 'primevue/confirmdialog'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContactosStore } from '../stores/contactosStore'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

const router = useRouter()
const route = useRoute()
const confirm = useConfirm()
const toast = useToast()
const store = useContactosStore()

const contacto = ref(null)
const checkingUser = ref(false)
const usuarioRegistrado = ref(null)
const uidUsuarioRegistrado = ref(null)

onMounted(() => {
  cargarContacto()
})

const cargarContacto = async () => {
  contacto.value = store.obtenerContactoPorId(route.params.id)
  
  if (!contacto.value) {
    toast.add({
      severity: 'error',
      summary: 'Contacto no encontrado',
      detail: 'El contacto que buscas no existe o ha sido eliminado',
      life: 3000
    })
    setTimeout(() => {
      router.push('/contactos')
    }, 1000)
  } else {
    // Verificar si el contacto está registrado
    await verificarUsuarioRegistrado()
  }
}

/**
 * Verifica si el email del contacto corresponde a un usuario registrado
 * Consulta la colección 'users' en Firestore
 */
const verificarUsuarioRegistrado = async () => {
  if (!contacto.value || !contacto.value.email) return
  
  checkingUser.value = true
  try {
    const q = query(
      collection(db, 'users'),
      where('email', '==', contacto.value.email)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      // El contacto está registrado
      usuarioRegistrado.value = true
      uidUsuarioRegistrado.value = querySnapshot.docs[0].data().uid
    } else {
      // El contacto NO está registrado
      usuarioRegistrado.value = false
      uidUsuarioRegistrado.value = null
    }
  } catch (error) {
    console.error('Error al verificar usuario:', error)
    usuarioRegistrado.value = false
  } finally {
    checkingUser.value = false
  }
}

/**
 * Abre el chat con el usuario registrado
 */
const abrirChat = () => {
  if (uidUsuarioRegistrado.value) {
    router.push(`/chat/${uidUsuarioRegistrado.value}`)
  }
}

/**
 * Abre el cliente de correo para invitar al contacto
 */
const invitarContacto = () => {
  const subject = encodeURIComponent('Invitación a la aplicación')
  const body = encodeURIComponent(
    `Hola ${contacto.value.nombre},\n\n` +
    `Te invito a unirte a nuestra aplicación de gestión de contactos.\n\n` +
    `Saludos`
  )
  window.location.href = `mailto:${contacto.value.email}?subject=${subject}&body=${body}`
}

// Función para obtener iniciales del contacto
const getIniciales = () => {
  if (!contacto.value || !contacto.value.nombre) return '?'
  return store.getContactoIniciales(contacto.value)
}

const toggleFavoritoContacto = async () => {
  try {
    await store.toggleFavorito(route.params.id)
    toast.add({
      severity: 'success',
      summary: contacto.value.favorito ? 'Agregado a favoritos' : 'Quitado de favoritos',
      detail: `El contacto ha sido ${contacto.value.favorito ? 'agregado a' : 'quitado de'} favoritos`,
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar el favorito',
      life: 3000
    })
  }
}

const volver = () => {
  router.push('/contactos')
}

const editar = () => {
  router.push(`/contactos/${route.params.id}/editar`)
}

const confirmarEliminar = () => {
  confirm.require({
    message: `¿Estás seguro de eliminar el contacto "${contacto.value.nombre}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await store.eliminarContacto(contacto.value.id)
        toast.add({
          severity: 'success',
          summary: 'Contacto eliminado',
          detail: `El contacto "${contacto.value.nombre}" ha sido eliminado correctamente`,
          life: 3000
        })
        router.push('/contactos')
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el contacto',
          life: 3000
        })
      }
    }
  })  
}
</script>