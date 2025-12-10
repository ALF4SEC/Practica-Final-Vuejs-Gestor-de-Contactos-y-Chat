# 📁 Estructura del Proyecto

```
gestorContactosYChat/
│
├── 📄 README.md                          ← NUEVO - Resumen ejecutivo
├── 📄 INICIO_RAPIDO.md                   ← NUEVO - Guía de inicio rápido
├── 📄 CONFIGURACION_FIREBASE.md          ← NUEVO - Guía detallada Firebase
├── 📄 RESUMEN_IMPLEMENTACION.md          ← NUEVO - Detalles técnicos
├── 📄 .env.example                       ← NUEVO - Plantilla variables entorno
├── 📄 .gitignore                         ← MODIFICADO - Añadido .env
├── 📄 package.json                       ← Dependencias del proyecto
├── 📄 vite.config.js                     ← Configuración Vite
├── 📄 index.html                         ← Punto de entrada HTML
│
├── 📂 public/                            ← Archivos estáticos
│
├── 📂 src/                               ← Código fuente
│   │
│   ├── 📄 main.js                        ← Punto de entrada JavaScript
│   ├── 📄 App.vue                        ← MODIFICADO - Componente raíz + auth
│   ├── 📄 firebase.js                    ← NUEVO - Configuración Firebase
│   ├── 📄 style.css                      ← Estilos globales
│   │
│   ├── 📂 assets/                        ← Recursos (imágenes, etc.)
│   │
│   ├── 📂 components/                    ← Componentes Vue
│   │   ├── 📄 ContactosList.vue          ← MODIFICADO - Lista de contactos
│   │   ├── 📄 ContactoDetalle.vue        ← MODIFICADO - Detalle + detección usuarios
│   │   └── 📄 ContactoForm.vue           ← MODIFICADO - Formulario crear/editar
│   │
│   ├── 📂 views/                         ← Vistas de rutas
│   │   ├── 📄 LoginView.vue              ← NUEVO - Vista de login
│   │   ├── 📄 RegisterView.vue           ← NUEVO - Vista de registro
│   │   └── 📄 ChatView.vue               ← NUEVO - Vista de chat
│   │
│   ├── 📂 router/                        ← Configuración de rutas
│   │   └── 📄 index.js                   ← MODIFICADO - Rutas + guards
│   │
│   └── 📂 stores/                        ← Stores de Pinia
│       ├── 📄 authStore.js               ← NUEVO - Store de autenticación
│       └── 📄 contactosStore.js          ← MODIFICADO - Store de contactos (Firestore)
│
└── 📂 node_modules/                      ← Dependencias (generado por npm)
```

---

## 🗂️ Organización por Funcionalidad

### 🔐 Autenticación
```
src/
├── firebase.js                    → Configuración Firebase Auth
├── stores/authStore.js            → Gestión de usuarios
├── views/LoginView.vue            → Pantalla de login
└── views/RegisterView.vue         → Pantalla de registro
```

### 📇 Gestión de Contactos
```
src/
├── stores/contactosStore.js       → CRUD + Firestore sync
├── components/
│   ├── ContactosList.vue          → Tabla de contactos
│   ├── ContactoDetalle.vue        → Detalle individual
│   └── ContactoForm.vue           → Crear/Editar
```

### 💬 Chat en Tiempo Real
```
src/
└── views/ChatView.vue             → Mensajería 1-a-1
```

### 🚦 Navegación y Protección
```
src/
├── router/index.js                → Rutas + Guards
└── App.vue                        → Layout principal
```

---

## 📦 Dependencias Clave (package.json)

```json
{
  "dependencies": {
    "vue": "^3.5.24",              // Framework principal
    "vue-router": "^4.2.5",        // Enrutamiento
    "pinia": "^2.1.7",             // Estado global
    "firebase": "^10.7.1",         // Backend (Auth + Firestore)
    "primevue": "^3.48.1",         // Componentes UI
    "primeicons": "^6.0.1"         // Iconos
  }
}
```

---

## 🔄 Flujo de Datos

```
Usuario
  ↓
App.vue (inicializa authStore)
  ↓
authStore.initAuth() → Firebase Auth
  ↓
Si autenticado → contactosStore.initContactos()
  ↓
Firestore onSnapshot → Actualiza contactos en tiempo real
  ↓
Componentes (ContactosList, etc.) → Renderiza datos
```

---

## 🛣️ Rutas Disponibles

| Ruta | Componente | Protegida | Descripción |
|------|-----------|-----------|-------------|
| `/` | - | No | Redirige a `/contactos` |
| `/login` | LoginView | No (solo invitados) | Inicio de sesión |
| `/register` | RegisterView | No (solo invitados) | Registro |
| `/contactos` | ContactosList | Sí | Lista de contactos |
| `/contactos/nuevo` | ContactoForm | Sí | Crear contacto |
| `/contactos/:id` | ContactoDetalle | Sí | Ver detalle |
| `/contactos/:id/editar` | ContactoForm | Sí | Editar contacto |
| `/chat/:uidDestino` | ChatView | Sí | Chat con usuario |

---

## 🗄️ Estructura de Firestore

```
firestore/
│
├── 📂 users/                               ← Usuarios registrados
│   └── {uid}/
│       ├── uid: string
│       ├── email: string
│       ├── displayName: string
│       └── createdAt: timestamp
│
├── 📂 contactos/                           ← Contactos por usuario
│   └── {contactoId}/
│       ├── userId: string                  ← Filtro por usuario
│       ├── nombre: string
│       ├── email: string
│       ├── telefono: string
│       ├── empresa: string
│       ├── favorito: boolean
│       └── estado: "Activo" | "Inactivo"
│
└── 📂 chats/                               ← Conversaciones
    └── {chatId}/                           ← Formato: "uidA_uidB" (ordenado)
        └── 📂 messages/
            └── {messageId}/
                ├── from: string            ← uid remitente
                ├── to: string              ← uid destinatario
                ├── text: string            ← Contenido
                ├── timestamp: timestamp
                └── read: boolean
```

---

## 🎨 Componentes PrimeVue Utilizados

- **Layout**: Card, Panel
- **Forms**: InputText, Password, Dropdown, Checkbox, Button
- **Data**: DataTable, Column, Tag
- **Feedback**: Toast, ConfirmDialog, Message
- **Navigation**: Button (con icon + label)
- **Utilities**: Tooltip, Divider

---

## 📋 Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `vite.config.js` | Configuración del build tool |
| `package.json` | Dependencias y scripts |
| `.gitignore` | Archivos a ignorar en Git |
| `.env.example` | Plantilla para variables de entorno |
| `src/firebase.js` | Configuración de Firebase |

---

## 🔍 Puntos de Entrada

1. **HTML**: `index.html` → Monta la app en `<div id="app">`
2. **JavaScript**: `src/main.js` → Inicializa Vue, Pinia, Router, PrimeVue
3. **Vue**: `src/App.vue` → Layout principal + inicialización de auth

---

Esta estructura asegura:
- ✅ Separación clara de responsabilidades
- ✅ Código modular y mantenible
- ✅ Escalabilidad para nuevas funcionalidades
- ✅ Fácil navegación y comprensión del proyecto
