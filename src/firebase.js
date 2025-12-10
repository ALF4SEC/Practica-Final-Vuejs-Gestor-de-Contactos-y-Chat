import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

/**
 * Configuración de Firebase
 * 
 * OPCIÓN 1: Usar variables de entorno (recomendado para producción)
 * Crea un archivo .env en la raíz del proyecto y define las variables
 * 
 * OPCIÓN 2: Reemplazar directamente los valores (más rápido para desarrollo)
 * Obtén los valores en: Firebase Console > Project Settings > General > Your apps
 */
const firebaseConfig = {
    apiKey: "AIzaSyCBO3ow9hImCDMksws26y9p6-49heRBFCw",
    authDomain: "gestorcontactosychat-77cf6.firebaseapp.com",
    projectId: "gestorcontactosychat-77cf6",
    storageBucket: "gestorcontactosychat-77cf6.firebasestorage.app",
    messagingSenderId: "269733171750",
    appId: "1:269733171750:web:2b480cc5eea768a3148ce7",
    measurementId: "G-G49C7ZZJND"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar servicios
export const auth = getAuth(app)
export const db = getFirestore(app)

/**
 * REGLAS DE SEGURIDAD DE FIRESTORE (a configurar en Firebase Console)
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     
 *     // Solo usuarios autenticados pueden acceder
 *     match /{document=**} {
 *       allow read, write: if request.auth != null;
 *     }
 *     
 *     // Usuarios: solo pueden leer/actualizar su propio documento
 *     match /users/{userId} {
 *       allow read: if request.auth != null;
 *       allow write: if request.auth != null && request.auth.uid == userId;
 *     }
 *     
 *     // Contactos: solo pueden acceder a sus propios contactos
 *     match /contactos/{contactoId} {
 *       allow read, write: if request.auth != null && 
 *                             resource.data.userId == request.auth.uid;
 *       allow create: if request.auth != null && 
 *                       request.resource.data.userId == request.auth.uid;
 *     }
 *     
 *     // Chats: solo los dos participantes pueden leer/escribir
 *     match /chats/{chatId} {
 *       allow read, write: if request.auth != null && 
 *                             request.auth.uid in chatId.split('_');
 *       
 *       match /messages/{messageId} {
 *         allow read, write: if request.auth != null && 
 *                               request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).id.split('_');
 *       }
 *     }
 *   }
 * }
 */
