<template>
  <div class="p-4">
    <Card>
      <template #title>
        <div class="flex align-items-center justify-content-between">
          <div class="flex align-items-center gap-2">
            <Button 
              icon="pi pi-arrow-left" 
              @click="volver"
              text
              rounded
            />
            <span>Chat con {{ nombreDestino }}</span>
          </div>
          <Tag v-if="otroUsuario" :value="otroUsuario.email" severity="info" />
        </div>
      </template>
      <template #content>
        <div class="flex flex-column gap-3">
          <!-- Área de mensajes -->
          <div 
            ref="mensajesContainer"
            class="surface-ground border-round p-3" 
            style="height: 500px; overflow-y: auto;"
          >
            <div v-if="loadingMessages" class="flex align-items-center justify-content-center" style="height: 100%;">
              <i class="pi pi-spin pi-spinner text-4xl"></i>
            </div>
            
            <div v-else-if="mensajes.length === 0" class="flex align-items-center justify-content-center flex-column gap-2" style="height: 100%;">
              <i class="pi pi-comments text-6xl text-400"></i>
              <p class="text-600">No hay mensajes aún. ¡Inicia la conversación!</p>
            </div>
            
            <div v-else class="flex flex-column gap-2">
              <div 
                v-for="mensaje in mensajes" 
                :key="mensaje.id"
                :class="[
                  'flex',
                  mensaje.from === currentUser.uid ? 'justify-content-end' : 'justify-content-start'
                ]"
              >
                <Card 
                  :class="[
                    'shadow-2',
                    mensaje.from === currentUser.uid ? 'bg-primary' : 'surface-card'
                  ]"
                  style="max-width: 70%; min-width: 150px;"
                >
                  <template #content>
                    <div class="flex flex-column gap-2">
                      <p 
                        :class="[
                          'm-0',
                          mensaje.from === currentUser.uid ? 'text-white' : ''
                        ]"
                        style="word-wrap: break-word;"
                      >
                        {{ mensaje.text }}
                      </p>
                      <small 
                        :class="[
                          'text-right',
                          mensaje.from === currentUser.uid ? 'text-white' : 'text-600'
                        ]"
                        style="opacity: 0.8;"
                      >
                        {{ formatearFecha(mensaje.timestamp) }}
                      </small>
                    </div>
                  </template>
                </Card>
              </div>
            </div>
          </div>

          <!-- Área de entrada de mensaje -->
          <div class="flex gap-2">
            <InputText
              v-model="nuevoMensaje"
              placeholder="Escribe un mensaje..."
              class="flex-1"
              @keyup.enter="enviarMensaje"
              :disabled="enviando"
            />
            <Button 
              label="Enviar"
              icon="pi pi-send"
              @click="enviarMensaje"
              :disabled="!nuevoMensaje.trim() || enviando"
              :loading="enviando"
            />
          </div>
        </div>
      </template>
    </Card>
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore'
import { db } from '../firebase'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const currentUser = computed(() => authStore.currentUser)
const uidDestino = ref(route.params.uidDestino)
const chatId = ref('')
const mensajes = ref([])
const nuevoMensaje = ref('')
const enviando = ref(false)
const loadingMessages = ref(true)
const mensajesContainer = ref(null)
const otroUsuario = ref(null)
const nombreDestino = ref('Usuario')

let unsubscribe = null

onMounted(async () => {
  if (!currentUser.value) {
    toast.add({
      severity: 'error',
      summary: 'No autenticado',
      detail: 'Debes iniciar sesión para acceder al chat',
      life: 3000
    })
    router.push('/login')
    return
  }

  // Cargar información del otro usuario
  await cargarOtroUsuario()

  // Generar chatId: ordenar los UIDs alfabéticamente y unirlos con _
  const uids = [currentUser.value.uid, uidDestino.value].sort()
  chatId.value = uids.join('_')

  // Iniciar escucha de mensajes
  iniciarEscuchaMensajes()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

/**
 * Carga la información del usuario destino desde Firestore
 */
const cargarOtroUsuario = async () => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uidDestino.value))
    if (userDoc.exists()) {
      otroUsuario.value = userDoc.data()
      nombreDestino.value = otroUsuario.value.displayName || otroUsuario.value.email
    }
  } catch (error) {
    console.error('Error al cargar usuario:', error)
  }
}

/**
 * Inicia la escucha en tiempo real de los mensajes del chat
 */
const iniciarEscuchaMensajes = () => {
  const messagesRef = collection(db, 'chats', chatId.value, 'messages')
  const q = query(messagesRef, orderBy('timestamp', 'asc'))

  unsubscribe = onSnapshot(q, 
    (snapshot) => {
      mensajes.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      loadingMessages.value = false
      
      // Scroll automático al último mensaje
      nextTick(() => {
        scrollToBottom()
      })
    },
    (error) => {
      console.error('Error al cargar mensajes:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los mensajes',
        life: 3000
      })
      loadingMessages.value = false
    }
  )
}

/**
 * Envía un nuevo mensaje al chat
 */
const enviarMensaje = async () => {
  if (!nuevoMensaje.value.trim()) return

  enviando.value = true
  try {
    const messagesRef = collection(db, 'chats', chatId.value, 'messages')
    
    await addDoc(messagesRef, {
      from: currentUser.value.uid,
      to: uidDestino.value,
      text: nuevoMensaje.value.trim(),
      timestamp: serverTimestamp(),
      read: false
    })

    nuevoMensaje.value = ''
  } catch (error) {
    console.error('Error al enviar mensaje:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo enviar el mensaje',
      life: 3000
    })
  } finally {
    enviando.value = false
  }
}

/**
 * Formatea el timestamp del mensaje
 */
const formatearFecha = (timestamp) => {
  if (!timestamp) return ''
  
  // Firestore timestamp to Date
  const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  
  const ahora = new Date()
  const diff = ahora - fecha
  const minutos = Math.floor(diff / 60000)
  
  if (minutos < 1) return 'Ahora'
  if (minutos < 60) return `Hace ${minutos}m`
  
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `Hace ${horas}h`
  
  // Formato de fecha completo
  return fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Hace scroll automático al final del contenedor de mensajes
 */
const scrollToBottom = () => {
  if (mensajesContainer.value) {
    mensajesContainer.value.scrollTop = mensajesContainer.value.scrollHeight
  }
}

const volver = () => {
  router.push('/contactos')
}
</script>
