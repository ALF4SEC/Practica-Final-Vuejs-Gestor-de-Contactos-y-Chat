import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import ContactoDetalle from '../components/ContactoDetalle.vue'
import ContactoForm from '../components/ContactoForm.vue'
import ContactosList from '../components/ContactosList.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ChatView from '../views/ChatView.vue'

const routes = [
  {
    path: '/',
    redirect: '/contactos'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresGuest: true }
  },
  {
    path: '/contactos',
    name: 'contactos',
    component: ContactosList,
    meta: { requiresAuth: true }
  },
  {
    path: '/contactos/nuevo',
    name: 'contactos-nuevo',
    component: ContactoForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/contactos/:id',
    name: 'contactos-detalle',
    component: ContactoDetalle,
    meta: { requiresAuth: true }
  },
  {
    path: '/contactos/:id/editar',
    name: 'contactos-editar',
    component: ContactoForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/chat/:uidDestino',
    name: 'chat',
    component: ChatView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * Navigation Guard
 * Protege rutas privadas y redirige usuarios autenticados desde login/register
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  
  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  }
  // Si la ruta es para invitados (login/register) y el usuario ya está autenticado
  else if (requiresGuest && authStore.isAuthenticated) {
    next('/contactos')
  }
  // En cualquier otro caso, permitir la navegación
  else {
    next()
  }
})

export default router
