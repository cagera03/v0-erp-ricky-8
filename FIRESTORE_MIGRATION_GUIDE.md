# Guía de Migración a Firestore

## Resumen

El ERP ahora usa **Firebase Firestore** como base de datos principal en lugar de localStorage. Esta migración proporciona:

- ✅ Datos persistentes en la nube
- ✅ Sincronización en tiempo real entre usuarios
- ✅ Escalabilidad empresarial
- ✅ Backup automático
- ✅ Seguridad con reglas de Firestore

## Estructura de Colecciones

\`\`\`
/users/{userId}
  - email: string
  - name: string
  - role: "admin" | "user"
  - companyId?: string
  - createdAt: timestamp
  - updatedAt: timestamp

/companies/{companyId}
  - name: string
  - rfc: string
  - address: string
  - phone: string
  - email: string
  - createdAt: timestamp

/products/{productId}
  - sku: string
  - name: string
  - category: string
  - stock: number
  - price: number
  - cost: number
  - minStock: number
  - unit: string
  - companyId: string
  - createdAt: timestamp
  - updatedAt: timestamp

/customers/{customerId}
  - name: string
  - rfc: string
  - email: string
  - phone: string
  - address: string
  - status: "active" | "inactive" | "vip"
  - creditLimit: number
  - balance: number
  - companyId: string
  - createdAt: timestamp
  - updatedAt: timestamp

/orders/{orderId}
  - customerId: string
  - items: array
  - total: number
  - status: "pending" | "processing" | "completed" | "cancelled"
  - companyId: string
  - createdAt: timestamp
  - updatedAt: timestamp

/suppliers/{supplierId}
  - similar structure to customers

/employees/{employeeId}
  - name: string
  - position: string
  - department: string
  - email: string
  - phone: string
  - salary: number
  - hireDate: timestamp
  - companyId: string

/invoices/{invoiceId}
/quotations/{quotationId}
/prospects/{prospectId}
/banks/{bankId}
/documents/{documentId}
/requisitions/{requisitionId}
/attributes/{attributeId}
/serviceOrders/{serviceOrderId}
\`\`\`

## Cómo Usar en Componentes

### Opción 1: Hook useFirestore (Recomendado)

\`\`\`typescript
import { useFirestore } from "@/hooks/use-firestore"
import { COLLECTIONS } from "@/lib/firestore"

function ProductsPage() {
  // Real-time updates automáticos
  const { items: products, loading, create, update, remove } = useFirestore(
    COLLECTIONS.products,
    [], // optional query constraints
    true // enable realtime
  )

  const handleAddProduct = async () => {
    await create({
      sku: "PROD-001",
      name: "Rosa Roja",
      category: "Flores",
      stock: 100,
      price: 25,
      cost: 15,
      minStock: 50,
      unit: "Pieza"
    })
  }

  return (
    <div>
      {loading ? <p>Cargando...</p> : products.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  )
}
\`\`\`

### Opción 2: Funciones Directas de Firestore

\`\`\`typescript
import { getItems, addItem, updateItem, deleteItem, subscribeToCollection } from "@/lib/firestore"
import { COLLECTIONS } from "@/lib/firestore"
import { where } from "firebase/firestore"

// Get items once
const products = await getItems(COLLECTIONS.products)

// Get filtered items
const activeProducts = await getItems(COLLECTIONS.products, [
  where("status", "==", "active"),
  where("stock", ">", 0)
])

// Add item
await addItem(COLLECTIONS.products, { name: "Rosa Roja", price: 25 })

// Update item
await updateItem(COLLECTIONS.products, productId, { price: 30 })

// Delete item
await deleteItem(COLLECTIONS.products, productId)

// Real-time listener
const unsubscribe = subscribeToCollection(
  COLLECTIONS.products,
  (products) => {
    console.log("Products updated:", products)
  },
  [where("stock", "<", 50)] // optional filters
)
\`\`\`

## Migración de Código Existente

### Antes (localStorage)
\`\`\`typescript
import { useData } from "@/hooks/use-data"

const { items, create, update, remove } = useData("products")
\`\`\`

### Después (Firestore)
\`\`\`typescript
import { useFirestore } from "@/hooks/use-firestore"
import { COLLECTIONS } from "@/lib/firestore"

const { items, create, update, remove } = useFirestore(COLLECTIONS.products)
\`\`\`

## Reglas de Seguridad de Firestore

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) || isAdmin();
    }
    
    // All business collections
    match /{collection}/{document} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAdmin();
    }
  }
}
\`\`\`

## Protección de Rutas por Rol

\`\`\`typescript
import { useAuth } from "@/lib/auth-context"

function AdminPage() {
  const { user, isAdmin } = useAuth()
  
  if (!isAdmin) {
    return <p>Acceso denegado. Solo administradores.</p>
  }
  
  return <div>Panel de Administración</div>
}
\`\`\`

## Crear Primer Usuario Admin

En Firebase Console > Authentication:

1. Crear usuario con email/password
2. Copiar el UID del usuario
3. En Firestore, crear documento en `users/{UID}`:

\`\`\`json
{
  "email": "admin@nexo.com",
  "name": "Administrador",
  "role": "admin",
  "createdAt": "2025-01-02T00:00:00Z",
  "updatedAt": "2025-01-02T00:00:00Z"
}
\`\`\`

## Inicializar Datos de Prueba

Usa la consola de Firebase o un script de seed para crear datos iniciales en Firestore.

## Variables de Entorno Requeridas

Ya configuradas en Vercel:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Notas Importantes

1. **Singleton Pattern**: Firebase se inicializa una sola vez en `lib/firebase.ts`
2. **Real-time por defecto**: `useFirestore` usa `onSnapshot` para updates automáticos
3. **Timestamps automáticos**: `createdAt` y `updatedAt` se agregan automáticamente
4. **Sanitización de datos**: Los hooks filtran valores null/undefined automáticamente
5. **Backward compatibility**: Los archivos antiguos se mantienen pero están deprecados
\`\`\`

\`\`\`json file="" isHidden
