# Gestor de Contactos con Chat - Vue 3 + Firebase

Aplicación de gestión de contactos con autenticación y chat en tiempo real, construida con Vue 3, PrimeVue, Pinia y Firebase.

## 🚀 Características

- ✅ Autenticación con Firebase (Email/Password)
- ✅ Verificación de email con correo automático
- ✅ Recuperación de contraseña por email
- ✅ Gestión completa de contactos (CRUD)
- ✅ Almacenamiento en Firestore con sincronización en tiempo real
- ✅ Actualización automática de la lista sin necesidad de índices compuestos
- ✅ Detección de contactos registrados
- ✅ Chat uno-a-uno en tiempo real
- ✅ Interfaz moderna con PrimeVue
- ✅ Rutas protegidas con guards
- ✅ Validación de formularios

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Cuenta de Firebase

## 🔧 Configuración de Firebase

### 1. Crear un proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Sigue los pasos para crear tu proyecto

### 2. Habilitar Authentication

1. En Firebase Console, ve a **Authentication**
2. Haz clic en **Comenzar**
3. En la pestaña **Sign-in method**, habilita **Correo electrónico/contraseña**
4. En la pestaña **Templates**, personaliza los emails de:
   - **Verificación de correo electrónico**: Email que se envía al registrarse
   - **Restablecimiento de contraseña**: Email para recuperar la contraseña
   - Puedes personalizar el idioma, remitente y contenido de estos emails

### 3. Crear Firestore Database

1. En Firebase Console, ve a **Firestore Database**
2. Haz clic en **Crear base de datos**
3. Selecciona **Modo de prueba** (temporalmente)
4. Elige una ubicación cercana a tus usuarios

### 4. Configurar las reglas de seguridad de Firestore

En Firestore Database > Reglas, reemplaza el contenido con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios: solo pueden leer/actualizar su propio documento
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Contactos: solo pueden acceder a sus propios contactos
    match /contactos/{contactoId} {
      allow read, write: if request.auth != null && 
                            resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
    
    // Chats: solo los dos participantes pueden leer/escribir
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid in chatId.split('_');
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
                              request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).id.split('_');
      }
    }
  }
}
```

### 5. Obtener las credenciales de Firebase

1. En Firebase Console, ve a **Configuración del proyecto** (icono de engranaje)
2. En la sección **Tus aplicaciones**, haz clic en el icono web `</>`
3. Registra tu aplicación con un nombre (ej: "Gestor de Contactos")
4. Copia el objeto `firebaseConfig`

### 6. Configurar las credenciales en el proyecto

Abre el archivo `src/firebase.js` y reemplaza los valores de `firebaseConfig` con los tuyos:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
}
```

## 📦 Instalación

1. Clona el repositorio o descarga el código

2. Instala las dependencias:
```bash
npm install
```

3. Configura Firebase (ver sección anterior)

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

5. Abre tu navegador en `http://localhost:5173`

## 🎯 Uso de la Aplicación

### 1. Registro e Inicio de Sesión

- Accede a `/register` para crear una nueva cuenta
- Usa email y contraseña (mínimo 6 caracteres)
- **Automáticamente recibirás un correo de verificación** en la dirección proporcionada
- Puedes iniciar sesión inmediatamente, pero verás un banner recordándote verificar tu email
- Haz clic en "Reenviar email" si no lo recibiste

### Recuperación de Contraseña

- En la pantalla de login, si olvidaste tu contraseña:
  1. Ingresa tu email en el campo correspondiente
  2. Haz clic en "¿Olvidaste tu contraseña?"
  3. Recibirás un correo con un enlace para restablecer tu contraseña
  4. Sigue las instrucciones del email para crear una nueva contraseña

### 2. Gestión de Contactos

- **Crear**: Haz clic en "Nuevo Contacto" y completa el formulario
- **Ver**: Haz clic en el icono de ojo para ver los detalles
- **Editar**: Haz clic en el icono de lápiz
- **Eliminar**: Haz clic en el icono de papelera y confirma
- **Favoritos**: Marca/desmarca desde el detalle del contacto

### 3. Chat en Tiempo Real

- En el detalle de un contacto, si el email coincide con un usuario registrado, verás un botón "Abrir Chat"
- Si no está registrado, verás un botón "Invitar por Email" que abrirá tu cliente de correo
- Los mensajes se sincronizan en tiempo real entre usuarios

## 🏗️ Estructura del Proyecto

```
src/
├── components/
│   ├── ContactoDetalle.vue    # Detalle de contacto con detección de usuarios
│   ├── ContactoForm.vue        # Formulario crear/editar
│   └── ContactosList.vue       # Lista de contactos
├── stores/
│   ├── authStore.js           # Gestión de autenticación
│   └── contactosStore.js      # Gestión de contactos con Firestore
├── views/
│   ├── LoginView.vue          # Vista de inicio de sesión
│   ├── RegisterView.vue       # Vista de registro
│   └── ChatView.vue           # Chat en tiempo real
├── router/
│   └── index.js               # Rutas con guards
├── firebase.js                # Configuración de Firebase
├── App.vue                    # Componente principal
└── main.js                    # Punto de entrada
```

## 🔒 Seguridad

- Todas las rutas privadas están protegidas con navigation guards
- Los usuarios solo pueden acceder a sus propios datos en Firestore
- Las reglas de seguridad de Firestore validan permisos en el servidor
- Los chats solo son accesibles por los dos participantes

## 🛠️ Tecnologías Utilizadas

- **Vue 3** - Framework JavaScript progresivo
- **Vite** - Build tool y dev server
- **Pinia** - Gestión de estado
- **Vue Router** - Enrutamiento
- **PrimeVue** - Biblioteca de componentes UI
- **PrimeFlex** - Utilidades CSS
- **Firebase Auth** - Autenticación
- **Cloud Firestore** - Base de datos en tiempo real

## 📝 Notas Importantes

1. **Firestore Indexes**: Si recibes errores sobre índices faltantes, Firebase te proporcionará un enlace en la consola del navegador para crearlos automáticamente.

2. **Reglas de Seguridad**: Las reglas de Firestore mostradas son para producción. Asegúrate de configurarlas antes de desplegar tu aplicación.

3. **Variables de Entorno**: Para mayor seguridad, considera usar variables de entorno para las credenciales de Firebase en producción.

4. **Límites de Firebase**: El plan gratuito de Firebase tiene límites en operaciones de lectura/escritura y almacenamiento. Monitorea tu uso en Firebase Console.

## 🚀 Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en el directorio `dist/`.

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👥 Autor

Desarrollado como proyecto de práctica de Vue.js con Firebase.
