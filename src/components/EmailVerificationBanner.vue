<template>
  <Message v-if="!emailVerified" severity="warn" :closable="false" class="mb-3">
    <div class="flex align-items-center justify-content-between">
      <div>
        <strong>Verifica tu email</strong>
        <p class="m-0 mt-1">
          Por favor verifica tu dirección de correo electrónico para acceder a todas las funcionalidades.
        </p>
      </div>
      <Button
        label="Reenviar email"
        icon="pi pi-send"
        size="small"
        outlined
        :loading="loading"
        @click="handleResendEmail"
        class="ml-3"
      />
    </div>
  </Message>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useToast } from 'primevue/usetoast'
import Message from 'primevue/message'
import Button from 'primevue/button'

const authStore = useAuthStore()
const toast = useToast()
const loading = ref(false)

const emailVerified = computed(() => {
  return authStore.user?.emailVerified ?? true
})

const handleResendEmail = async () => {
  loading.value = true
  const result = await authStore.resendVerificationEmail()
  loading.value = false
  
  if (result.success) {
    toast.add({
      severity: 'success',
      summary: 'Email enviado',
      detail: result.message,
      life: 4000
    })
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: result.error,
      life: 4000
    })
  }
}
</script>
