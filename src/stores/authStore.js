import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const currentUser = computed(() => user.value)

  /**
   * Inicializa el listener de autenticación
   * Mantiene sincronizado el estado con Firebase Auth
   */
  const initAuth = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          user.value = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0]
          }
        } else {
          user.value = null
        }
        loading.value = false
        resolve(firebaseUser)
      })
    })
  }

  /**
   * Registra un nuevo usuario con email y password
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @param {string} displayName - Nombre a mostrar (opcional)
   */
  const register = async (email, password, displayName = null) => {
    try {
      error.value = null
      loading.value = true
      
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      
      // Preparar displayName
      const name = displayName || email.split('@')[0]
      
      // Crear documento en Firestore users/{uid}
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: name,
        createdAt: serverTimestamp()
      })
      
      // Actualizar estado local
      user.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: name
      }
      
      return { success: true, user: user.value }
    } catch (err) {
      error.value = getErrorMessage(err.code)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Inicia sesión con email y password
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   */
  const login = async (email, password) => {
    try {
      error.value = null
      loading.value = true
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      
      user.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0]
      }
      
      return { success: true, user: user.value }
    } catch (err) {
      error.value = getErrorMessage(err.code)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Cierra la sesión del usuario actual
   */
  const logout = async () => {
    try {
      error.value = null
      await signOut(auth)
      user.value = null
      return { success: true }
    } catch (err) {
      error.value = getErrorMessage(err.code)
      return { success: false, error: error.value }
    }
  }

  /**
   * Convierte códigos de error de Firebase a mensajes legibles
   */
  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/invalid-email': 'Email inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de red. Verifica tu conexión'
    }
    return errorMessages[errorCode] || 'Error en la autenticación'
  }

  return {
    // Estado
    user,
    loading,
    error,
    // Getters
    isAuthenticated,
    currentUser,
    // Acciones
    initAuth,
    register,
    login,
    logout
  }
})
