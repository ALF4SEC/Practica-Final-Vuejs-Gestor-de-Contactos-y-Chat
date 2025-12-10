<template>
  <div class="flex align-items-center justify-content-center" style="min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <Card style="width: 100%; max-width: 450px;" class="shadow-4">
      <template #title>
        <div class="text-center">
          <i class="pi pi-user text-4xl mb-3" style="color: #667eea;"></i>
          <h2 class="m-0">Iniciar Sesión</h2>
          <p class="text-600 mt-2" style="font-weight: normal; font-size: 0.95rem;">Accede a tu gestor de contactos</p>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="handleLogin" class="flex flex-column gap-3">
          <div class="flex flex-column gap-2">
            <label for="email" class="font-semibold">
              <i class="pi pi-envelope" style="margin-right: 0.5rem;"></i>
              Email
            </label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="tu@email.com"
              :invalid="!!emailError"
              required
              autocomplete="email"
            />
            <small v-if="emailError" class="p-error">{{ emailError }}</small>
          </div>

          <div class="flex flex-column gap-2">
            <label for="password" class="font-semibold">
              <i class="pi pi-lock" style="margin-right: 0.5rem;"></i>
              Contraseña
            </label>
            <Password
              id="password"
              v-model="password"
              placeholder="Contraseña"
              :invalid="!!passwordError"
              :feedback="false"
              toggleMask
              required
              autocomplete="current-password"
            />
            <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
          </div>

          <Message v-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>

          <Button
            type="submit"
            label="Iniciar Sesión"
            icon="pi pi-sign-in"
            :loading="loading"
            class="w-full"
            size="large"
          />

          <Divider align="center">
            <span class="text-600" style="font-size: 0.875rem;">o</span>
          </Divider>

          <div class="text-center">
            <span class="text-600">¿No tienes cuenta? </span>
            <Button
              label="Regístrate aquí"
              link
              @click="goToRegister"
              class="p-0"
              style="font-weight: 600;"
            />
          </div>
        </form>
      </template>
    </Card>
    <Toast />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import Divider from 'primevue/divider'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')
const errorMessage = ref('')
const loading = ref(false)

const validateForm = () => {
  emailError.value = ''
  passwordError.value = ''
  errorMessage.value = ''
  
  let isValid = true
  
  if (!email.value) {
    emailError.value = 'El email es requerido'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    emailError.value = 'Email inválido'
    isValid = false
  }
  
  if (!password.value) {
    passwordError.value = 'La contraseña es requerida'
    isValid = false
  } else if (password.value.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }
  
  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return
  
  loading.value = true
  const result = await authStore.login(email.value, password.value)
  loading.value = false
  
  if (result.success) {
    toast.add({
      severity: 'success',
      summary: 'Bienvenido',
      detail: `Has iniciado sesión correctamente`,
      life: 3000
    })
    router.push('/contactos')
  } else {
    errorMessage.value = result.error
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>
