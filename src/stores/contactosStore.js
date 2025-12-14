import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthStore } from './authStore'

/**
 * @typedef {Object} Contacto
 * @property {string} id - ID único del contacto (Firestore document ID)
 * @property {string} userId - UID del usuario propietario del contacto
 * @property {string} nombre - Nombre completo del contacto
 * @property {string} email - Email del contacto
 * @property {string} [telefono] - Teléfono del contacto
 * @property {string} [empresa] - Empresa del contacto
 * @property {boolean} favorito - Si el contacto es favorito
 * @property {string} estado - Estado del contacto (Activo/Inactivo)
 */

export const useContactosStore = defineStore('contactos', () => {
  // Estado
  const contactos = ref([])
  const loading = ref(false)
  const error = ref(null)
  let unsubscribe = null

  // Getters
  const totalContactos = computed(() => contactos.value.length)
  
  const totalFavoritos = computed(() => 
    contactos.value.filter(c => c.favorito).length
  )
  
  const contactosActivos = computed(() => 
    contactos.value.filter(c => c.estado === 'Activo')
  )

  const obtenerContactoPorId = computed(() => {
    return (id) => contactos.value.find(c => c.id === id)
  })

  /**
   * Inicializa la suscripción en tiempo real a los contactos del usuario actual
   * Filtra por userId para que cada usuario solo vea sus propios contactos
   */
  const initContactos = () => {
    const authStore = useAuthStore()
    
    if (!authStore.currentUser) {
      contactos.value = []
      return
    }

    // Desuscribirse si ya hay una suscripción activa
    if (unsubscribe) {
      unsubscribe()
    }

    loading.value = true
    error.value = null

    try {
      // Crear query para obtener solo los contactos del usuario actual
      // NOTA: Removemos orderBy para evitar requerir índice compuesto
      // El ordenamiento se hará en el cliente
      const q = query(
        collection(db, 'contactos'),
        where('userId', '==', authStore.currentUser.uid)
      )

      // Suscribirse a cambios en tiempo real
      unsubscribe = onSnapshot(q, 
        (snapshot) => {
          // Ordenar los contactos alfabéticamente por nombre en el cliente
          contactos.value = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .sort((a, b) => {
              const nombreA = a.nombre?.toLowerCase() || ''
              const nombreB = b.nombre?.toLowerCase() || ''
              return nombreA.localeCompare(nombreB)
            })
          loading.value = false
        },
        (err) => {
          console.error('Error al cargar contactos:', err)
          error.value = 'Error al cargar contactos'
          loading.value = false
        }
      )
    } catch (err) {
      console.error('Error al inicializar contactos:', err)
      error.value = 'Error al inicializar contactos'
      loading.value = false
    }
  }

  /**
   * Detiene la suscripción en tiempo real
   */
  const stopContactos = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    contactos.value = []
  }

  /**
   * Crea un nuevo contacto en Firestore
   */
  const crearContacto = async (contacto) => {
    const authStore = useAuthStore()
    
    if (!authStore.currentUser) {
      throw new Error('Usuario no autenticado')
    }

    try {
      const nuevoContacto = {
        userId: authStore.currentUser.uid,
        nombre: contacto.nombre,
        email: contacto.email,
        telefono: contacto.telefono || '',
        empresa: contacto.empresa || '',
        favorito: contacto.favorito || false,
        estado: contacto.estado || 'Activo'
      }

      const docRef = await addDoc(collection(db, 'contactos'), nuevoContacto)
      return { id: docRef.id, ...nuevoContacto }
    } catch (err) {
      console.error('Error al crear contacto:', err)
      throw new Error('Error al crear contacto')
    }
  }

  /**
   * Actualiza un contacto existente en Firestore
   */
  const actualizarContacto = async (id, datosActualizados) => {
    const authStore = useAuthStore()
    
    if (!authStore.currentUser) {
      throw new Error('Usuario no autenticado')
    }

    try {
      const contactoRef = doc(db, 'contactos', id)
      
      // Preparar datos sin el ID
      const { id: _, userId: __, ...datosLimpios } = datosActualizados
      
      await updateDoc(contactoRef, datosLimpios)
      return true
    } catch (err) {
      console.error('Error al actualizar contacto:', err)
      throw new Error('Error al actualizar contacto')
    }
  }

  /**
   * Elimina un contacto de Firestore
   */
  const eliminarContacto = async (id) => {
    const authStore = useAuthStore()
    
    if (!authStore.currentUser) {
      throw new Error('Usuario no autenticado')
    }

    try {
      await deleteDoc(doc(db, 'contactos', id))
      return true
    } catch (err) {
      console.error('Error al eliminar contacto:', err)
      throw new Error('Error al eliminar contacto')
    }
  }

  /**
   * Alterna el estado de favorito de un contacto
   */
  const toggleFavorito = async (id) => {
    const contacto = contactos.value.find(c => c.id === id)
    if (!contacto) return false

    try {
      const contactoRef = doc(db, 'contactos', id)
      await updateDoc(contactoRef, {
        favorito: !contacto.favorito
      })
      return true
    } catch (err) {
      console.error('Error al actualizar favorito:', err)
      throw new Error('Error al actualizar favorito')
    }
  }

  /**
   * Obtiene las iniciales de un contacto (primera letra del nombre y apellido)
   * @param {Contacto} contacto - El contacto del cual obtener las iniciales
   * @returns {string} Las iniciales en mayúsculas (ej: "JP")
   */
  const getContactoIniciales = (contacto) => {
    if (!contacto || !contacto.nombre) return '?'
    const palabras = contacto.nombre.trim().split(' ')
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase()
    }
    return palabras[0][0].toUpperCase()
  }

  return {
    // Estado
    contactos,
    loading,
    error,
    // Getters
    totalContactos,
    totalFavoritos,
    contactosActivos,
    obtenerContactoPorId,
    // Acciones
    initContactos,
    stopContactos,
    crearContacto,
    actualizarContacto,
    eliminarContacto,
    toggleFavorito,
    // Helpers
    getContactoIniciales
  }
})
