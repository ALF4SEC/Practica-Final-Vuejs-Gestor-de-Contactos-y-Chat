# Gestor de contactos con chat

Práctica final de Vue.js. Es una agenda de contactos con cuentas de usuario y un chat uno a uno en tiempo real entre usuarios registrados. Está hecha con Vue 3 (Composition API), PrimeVue, Pinia, Vue Router y Firebase (Authentication y Firestore).

## Funcionalidades

### Cuentas de usuario

- Registro e inicio de sesión con email y contraseña (mínimo 6 caracteres). La sesión se mantiene al recargar la página.
- Al registrarse se envía un correo de verificación. Se puede entrar sin verificar, pero aparece un aviso con la opción de reenviar el correo.
- Recuperación de contraseña desde la pantalla de login: se escribe el email y se pulsa "¿Olvidaste tu contraseña?".
- Cada usuario nuevo se guarda también en la colección `users` de Firestore (`uid`, `email`, `displayName` y fecha de alta). Los errores de Firebase se muestran traducidos al español.

### Contactos

- Alta, consulta, edición y borrado de contactos. Cada contacto tiene nombre, email, teléfono, empresa, favorito y estado (activo o inactivo).
- Los contactos se guardan en la colección `contactos` con el `userId` del propietario, así que cada usuario solo ve los suyos.
- La lista se actualiza en tiempo real con `onSnapshot`. La consulta no usa `orderBy` para no necesitar un índice compuesto en Firestore.
- La barra superior muestra el número total de contactos y cuántos son favoritos.

### Chat

- En el detalle de un contacto, la app busca su email en la colección `users`. Si es un usuario registrado aparece el botón "Abrir Chat"; si no, "Invitar por Email", que abre el cliente de correo con un `mailto:`.
- El identificador de cada conversación se forma ordenando los dos `uid` y uniéndolos con `_`, de modo que los dos usuarios comparten el mismo chat.
- Los mensajes se guardan en `chats/{chatId}/messages` con `from`, `to`, `text`, `timestamp` y `read`, y se reciben en tiempo real.
- Los mensajes propios salen a la derecha y los del otro usuario a la izquierda, con la hora en formato relativo ("Hace 5m", "Hace 2h"). La vista baja sola hasta el último mensaje y se puede enviar con Enter.

### Interfaz

Toda la interfaz usa componentes de PrimeVue con el tema Aura, PrimeFlex para la maquetación y PrimeIcons, casi sin CSS propio. Hay validación de formularios, avisos tipo toast, confirmación antes de borrar o cerrar sesión, tooltips y etiquetas `aria-label`.

## Rutas

| Ruta | Vista | Acceso |
|---|---|---|
| `/login` | Inicio de sesión | Solo sin sesión |
| `/register` | Registro | Solo sin sesión |
| `/contactos` | Lista de contactos | Con sesión |
| `/contactos/nuevo` | Nuevo contacto | Con sesión |
| `/contactos/:id` | Detalle del contacto | Con sesión |
| `/contactos/:id/editar` | Editar contacto | Con sesión |
| `/chat/:uidDestino` | Chat con otro usuario | Con sesión |

`/` redirige a `/contactos`. Un guard global espera a que Firebase Auth termine de cargar y después manda a `/login` a quien no tiene sesión, o a `/contactos` a quien ya la tiene e intenta entrar en login o registro.

## Estructura

```
src/
  components/
    ContactoDetalle.vue          detalle, detección de usuario registrado y acceso al chat
    ContactoForm.vue             formulario de alta y edición
    ContactosList.vue            lista de contactos
    EmailVerificationBanner.vue  aviso de email sin verificar
  stores/
    authStore.js                 sesión, registro, verificación y recuperación de contraseña
    contactosStore.js            CRUD de contactos en Firestore
  views/
    LoginView.vue
    RegisterView.vue
    ChatView.vue
  router/index.js                rutas y guard de autenticación
  firebase.js                    inicialización de Firebase
  App.vue                        barra superior y contenedor principal
  main.js
firestore.rules                  reglas de seguridad de Firestore
```

## Puesta en marcha

Hace falta Node.js 16 o superior y una cuenta de Firebase.

### 1. Preparar Firebase

1. Crear un proyecto en la [consola de Firebase](https://console.firebase.google.com/).
2. En Authentication, activar el proveedor "Correo electrónico/contraseña". En la pestaña Templates se pueden personalizar el idioma, el remitente y el texto de los correos de verificación y de recuperación de contraseña.
3. Crear una base de datos en Firestore y elegir una ubicación cercana.
4. En Firestore, pestaña Reglas, pegar el contenido de `firestore.rules`. Las reglas dejan que cualquier usuario con sesión lea `users` (hace falta para detectar qué contactos están registrados), que cada uno solo modifique su propio documento de usuario y sus propios contactos, y que un chat solo lo lean y escriban los usuarios cuyo `uid` forma parte del `chatId`.
5. En la configuración del proyecto, registrar una aplicación web y copiar el objeto `firebaseConfig`.

### 2. Configurar el proyecto

Sustituir los valores de `firebaseConfig` en `src/firebase.js` por los del proyecto propio:

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

Ahora mismo el repositorio tiene escrita la configuración del proyecto de Firebase que usé para la práctica.

### 3. Instalar y arrancar

```bash
npm install
npm run dev
```

La aplicación queda en `http://localhost:5173`. Para generar la versión de producción en `dist/`:

```bash
npm run build
```

## Cómo probarla

1. Registrar un usuario, iniciar sesión y crear, editar, marcar como favorito y borrar algún contacto.
2. Registrar un segundo usuario con el email de uno de los contactos del primero.
3. Con el primer usuario, abrir el detalle de ese contacto: debería aparecer "Abrir Chat".
4. Abrir el chat con cada usuario en un navegador distinto y comprobar que los mensajes llegan al momento.

## Notas

- Si Firestore pide un índice que falta, el error de la consola del navegador trae un enlace para crearlo.
- El plan gratuito de Firebase tiene límites de lecturas, escrituras y almacenamiento. El consumo se puede ver en la consola de Firebase.
