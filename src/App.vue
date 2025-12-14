<template>
  <div id="app">
    <!-- Barra superior visible solo cuando el usuario está autenticado -->
    <div v-if="authStore.isAuthenticated" class="surface-card shadow-2 sticky top-0 z-5">
      <div class="p-3">
        <div class="flex justify-content-between align-items-center flex-wrap gap-3">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-users text-2xl"></i>
            <h1 class="text-2xl font-bold m-0">Gestor de Contactos</h1>
          </div>
          <div class="flex gap-3 align-items-center">
            <div class="flex gap-3">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-user"></i>
                <span>{{ contactosStore.totalContactos }} contactos</span>
              </div>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-star-fill"></i>
                <span>{{ contactosStore.totalFavoritos }} favoritos</span>
              </div>
            </div>
            <div class="flex align-items-center gap-2 border-left-1 border-200 pl-3">
              <i class="pi pi-user-edit"></i>
              <span>{{ authStore.currentUser?.displayName || authStore.currentUser?.email }}</span>
              <Button 
                icon="pi pi-sign-out" 
                label="Cerrar sesión"
                @click="handleLogout"
                severity="danger"
                text
                size="small"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <main :class="authStore.isAuthenticated ? 'p-4' : ''">
      <!-- Banner de verificación de email (solo si está autenticado) -->
      <EmailVerificationBanner v-if="authStore.isAuthenticated" />
      
      <router-view />
    </main>
    
    <Toast />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useContactosStore } from './stores/contactosStore'
import { useAuthStore } from './stores/authStore'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import EmailVerificationBanner from './components/EmailVerificationBanner.vue'

const contactosStore = useContactosStore()
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

onMounted(async () => {
  // Inicializar autenticación solo si no se ha inicializado
  // El router guard también puede llamar a initAuth, pero esta implementación
  // garantiza que solo se ejecute una vez gracias al control en authStore
  await authStore.initAuth()
  
  // Si el usuario está autenticado, inicializar contactos
  if (authStore.isAuthenticated) {
    contactosStore.initContactos()
  }
})

// Watch para detectar cambios en la autenticación
// Cuando el usuario hace login, se inicializan los contactos automáticamente
watch(() => authStore.isAuthenticated, (isAuthenticated, wasAuthenticated) => {
  if (isAuthenticated && !wasAuthenticated) {
    // El usuario acaba de autenticarse (login o registro)
    contactosStore.initContactos()
  } else if (!isAuthenticated && wasAuthenticated) {
    // El usuario acaba de cerrar sesión
    contactosStore.stopContactos()
  }
})

/**
 * Maneja el cierre de sesión
 */
const handleLogout = async () => {
  const result = await authStore.logout()
  
  if (result.success) {
    // El watch detectará el cambio y detendrá los contactos automáticamente
    toast.add({
      severity: 'success',
      summary: 'Sesión cerrada',
      detail: 'Has cerrado sesión correctamente',
      life: 3000
    })
    
    router.push('/login')
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cerrar sesión',
      life: 3000
    })
  }
}
</script>
