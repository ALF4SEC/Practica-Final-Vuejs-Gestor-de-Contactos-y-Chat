# 🚀 Inicio Rápido

## Paso 1: Configurar Firebase (5 minutos)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Authentication** → **Email/Password**
4. Crea una **Firestore Database** en modo prueba
5. Ve a **Configuración del proyecto** → **General** → **Tus aplicaciones**
6. Copia tus credenciales de Firebase

## Paso 2: Configurar las Credenciales

Abre `src/firebase.js` y reemplaza con tus credenciales:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
}
```

## Paso 3: Configurar Reglas de Firestore

En **Firestore Database** → **Reglas**, copia y pega:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /contactos/{contactoId} {
      allow read, write: if request.auth != null && 
                            resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
    
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid in chatId.split('_');
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

Haz clic en **Publicar**.

## Paso 4: Instalar y Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

## Paso 5: Probar la Aplicación

1. Abre `http://localhost:5173`
2. Regístrate con un email y contraseña
3. Crea algunos contactos
4. Registra un segundo usuario usando el email de uno de tus contactos
5. Vuelve al primer usuario y abre el detalle del contacto registrado
6. ¡Verás el botón "Abrir Chat"!

## 🎉 ¡Listo!

Ya tienes un gestor de contactos completo con:
- ✅ Autenticación segura
- ✅ Gestión de contactos en tiempo real
- ✅ Chat uno-a-uno
- ✅ Detección de usuarios registrados

## ⚠️ Troubleshooting

**Error: "Missing or insufficient permissions"**
→ Verifica que las reglas de Firestore estén configuradas correctamente

**Error: "Firebase: Error (auth/...)"**
→ Asegúrate de que Authentication esté habilitado con Email/Password

**No se cargan los contactos**
→ Revisa la consola del navegador y verifica tu configuración de Firebase

## 📚 Más Información

- `CONFIGURACION_FIREBASE.md` - Guía detallada de configuración
- `RESUMEN_IMPLEMENTACION.md` - Detalles técnicos de la implementación
