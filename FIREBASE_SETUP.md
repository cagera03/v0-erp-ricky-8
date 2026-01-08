# Configuración de Firebase Authentication para Nexo ERP

## Variables de Entorno Requeridas

Las siguientes variables ya están configuradas en Vercel:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Configuración de Firestore

El sistema automáticamente crea documentos de usuario en la colección `users` con la siguiente estructura:

\`\`\`typescript
{
  email: string
  name: string
  role: "admin" | "user"
  createdAt: Timestamp
  updatedAt: Timestamp
}
\`\`\`

## Reglas de Seguridad de Firestore

Configura estas reglas en Firebase Console > Firestore Database > Rules:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read their own document
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Only authenticated users can create (done on registration)
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Users can update their own profile (except role)
      allow update: if request.auth != null 
        && request.auth.uid == userId
        && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']);
      
      // Admins can read and update any user
      allow read, update: if request.auth != null 
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Other collections - adjust based on your needs
    match /{document=**} {
      // Only authenticated users can access
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

## Reglas de Autenticación de Firebase

En Firebase Console > Authentication > Settings:

1. **Email/Password**: Habilitar el proveedor de Email/Password
2. **Email Enumeration Protection**: Activar para mayor seguridad
3. **Password Policy**: Configurar mínimo 6 caracteres (ya implementado)

## Crear Primer Usuario Administrador

### Opción 1: Mediante Firebase Console
1. Ve a Firebase Console > Authentication > Users
2. Agrega un usuario manualmente con email y contraseña
3. Copia el UID del usuario
4. Ve a Firestore Database > users
5. Crea un documento con el UID como ID y estos campos:
   \`\`\`
   email: "admin@ejemplo.com"
   name: "Administrador"
   role: "admin"
   createdAt: [timestamp actual]
   updatedAt: [timestamp actual]
   \`\`\`

### Opción 2: Mediante el login (recomendado)
1. Registra un usuario normalmente desde la app
2. Ve a Firestore Database > users
3. Encuentra el documento del usuario
4. Cambia el campo `role` de "user" a "admin"

## Sistema de Roles

- **admin**: Acceso completo al sistema, puede gestionar usuarios
- **user**: Acceso estándar al ERP

Los roles se almacenan en Firestore y se validan en el cliente. Para mayor seguridad en producción, considera implementar Firebase Security Rules más estrictas.

## Seguridad en Producción

Para un sistema de producción robusto, considera:

1. **Firebase Admin SDK**: Para operaciones del lado del servidor
   - Variables adicionales necesarias:
     - `FIREBASE_ADMIN_PROJECT_ID`
     - `FIREBASE_ADMIN_PRIVATE_KEY`
     - `FIREBASE_ADMIN_CLIENT_EMAIL`

2. **Custom Claims**: Para roles más seguros usando Admin SDK

3. **Rate Limiting**: Implementar límites de intentos de login

4. **Logging y Auditoría**: Registrar accesos y cambios importantes

## Testing

Usuarios de prueba (crear manualmente en Firebase):

\`\`\`
Email: admin@nexoerp.com
Password: [configurar en Firebase]
Role: admin

Email: user@nexoerp.com  
Password: [configurar en Firebase]
Role: user
\`\`\`

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
- Verifica que todas las variables NEXT_PUBLIC_FIREBASE_* estén correctamente configuradas en Vercel

### Error: "Missing or insufficient permissions"
- Revisa las reglas de seguridad de Firestore
- Asegúrate de que el usuario esté autenticado

### Error: "Network request failed"
- Verifica la conexión a internet
- Revisa que el proyecto de Firebase esté activo
- Confirma que las URLs de Firebase sean correctas

## Despliegue en Vercel

1. Todas las variables NEXT_PUBLIC_FIREBASE_* ya están configuradas
2. El build incluirá automáticamente el SDK de Firebase
3. Las rutas están protegidas con AuthGuard y AuthProvider
4. El sistema redirige automáticamente según el estado de autenticación

## Próximos Pasos

1. Crear primer usuario administrador en Firebase Console
2. Probar login y recuperación de contraseña
3. Verificar que las rutas estén protegidas correctamente
4. Configurar reglas de seguridad de Firestore
5. Opcionalmente: Implementar Firebase Admin SDK para mayor seguridad
