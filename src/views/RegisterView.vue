<template>
  <div class="flex align-items-center justify-content-center" style="min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <Card style="width: 100%; max-width: 450px;" class="shadow-4">
      <template #title>
        <div class="text-center">
          <i class="pi pi-user-plus text-4xl mb-3" style="color: #667eea;"></i>
          <h2 class="m-0">Crear Cuenta</h2>
          <p class="text-600 mt-2" style="font-weight: normal; font-size: 0.95rem;">Únete al gestor de contactos</p>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="handleRegister" class="flex flex-column gap-3">
          <div class="flex flex-column gap-2">
            <label for="displayName" class="font-semibold">
              <i class="pi pi-user" style="margin-right: 0.5rem;"></i>
              Nombre
            </label>
            <InputText
              id="displayName"
              v-model="displayName"
              placeholder="Tu nombre"
              :invalid="!!displayNameError"
              autocomplete="name"
            />
            <small v-if="displayNameError" class="p-error">{{ displayNameError }}</small>
            <small class="text-600">Opcional: se usará tu email si no especificas</small>
          </div>

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
              placeholder="Contraseña (mínimo 6 caracteres)"
              :invalid="!!passwordError"
              toggleMask
              required
              autocomplete="new-password"
            >
              <template #header>
                <h6>Selecciona una contraseña</h6>
              </template>
              <template #footer>
                <p class="mt-2">Requerimientos:</p>
                <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                  <li>Mínimo 6 caracteres</li>
                </ul>
              </template>
            </Password>
            <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
          </div>

          <div class="flex flex-column gap-2">
            <label for="confirmPassword" class="font-semibold">
              <i class="pi pi-lock" style="margin-right: 0.5rem;"></i>
              Confirmar Contraseña
            </label>
            <Password
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="Confirma tu contraseña"
              :invalid="!!confirmPasswordError"
              :feedback="false"
              toggleMask
              required
              autocomplete="new-password"
            />
            <small v-if="confirmPasswordError" class="p-error">{{ confirmPasswordError }}</small>
          </div>

          <Message v-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>

          <Button
            type="submit"
            label="Crear Cuenta"
            icon="pi pi-user-plus"
            :loading="loading"
            class="w-full"
            size="large"
          />

          <Divider align="center">
            <span class="text-600" style="font-size: 0.875rem;">o</span>
          </Divider>

          <div class="text-center">
            <span class="text-600">¿Ya tienes cuenta? </span>
            <Button
              label="Inicia sesión aquí"
              link
              @click="goToLogin"
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

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const displayNameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const errorMessage = ref('')
const loading = ref(false)

const validateForm = () => {
  displayNameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
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
  
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Debes confirmar la contraseña'
    isValid = false
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Las contraseñas no coinciden'
    isValid = false
  }
  
  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return
  
  loading.value = true
  const result = await authStore.register(
    email.value, 
    password.value, 
    displayName.value || null
  )
  loading.value = false
  
  if (result.success) {
    toast.add({
      severity: 'success',
      summary: 'Cuenta creada',
      detail: 'Tu cuenta ha sido creada exitosamente',
      life: 3000
    })
    router.push('/contactos')
  } else {
    errorMessage.value = result.error
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>
