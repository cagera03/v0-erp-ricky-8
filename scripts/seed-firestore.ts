/**
 * Script para inicializar datos de prueba en Firestore
 * Ejecutar desde /scripts folder en v0
 */

import { initializeApp, getApps } from "firebase/app"
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore"

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

// Sample data
const sampleData = {
  companies: [
    {
      name: "Nexo Florería S.A. de C.V.",
      rfc: "NEX850101XYZ",
      address: "Av. Insurgentes 123, CDMX",
      phone: "555-1234",
      email: "contacto@nexo.com",
    },
  ],
  products: [
    {
      sku: "ROSA-ROJA-001",
      name: "Rosa Roja Premium",
      category: "Flores Cortadas",
      stock: 150,
      price: 25.0,
      cost: 15.0,
      minStock: 50,
      unit: "Pieza",
      companyId: "default",
    },
    {
      sku: "TULIP-MIX-002",
      name: "Tulipanes Mix Colores",
      category: "Flores Cortadas",
      stock: 80,
      price: 20.0,
      cost: 12.0,
      minStock: 30,
      unit: "Pieza",
      companyId: "default",
    },
    {
      sku: "ORQUI-BLANCA-003",
      name: "Orquídea Blanca",
      category: "Plantas",
      stock: 25,
      price: 180.0,
      cost: 120.0,
      minStock: 10,
      unit: "Pieza",
      companyId: "default",
    },
  ],
  customers: [
    {
      name: "Constructora ABC S.A. de C.V.",
      rfc: "CAB850101XY9",
      email: "contacto@constructoraabc.com",
      phone: "555-1234",
      address: "Av. Insurgentes 123, CDMX",
      status: "active",
      creditLimit: 50000,
      balance: 12500,
      companyId: "default",
    },
    {
      name: "Comercializadora DEF",
      rfc: "CDE900202ZW8",
      email: "ventas@comercializadoradef.com",
      phone: "555-5678",
      address: "Reforma 456, Monterrey",
      status: "vip",
      creditLimit: 100000,
      balance: 25000,
      companyId: "default",
    },
  ],
  suppliers: [
    {
      name: "Distribuidora Flores del Norte",
      rfc: "DFN950303AB1",
      email: "ventas@floresdelnorte.com",
      phone: "555-9876",
      address: "Boulevard Norte 789, Querétaro",
      rating: 4.5,
      productsSupplied: "Rosas, Tulipanes, Lirios",
      totalPurchases: 125000,
      companyId: "default",
    },
  ],
  employees: [
    {
      name: "Roberto Martínez",
      position: "Vendedor",
      department: "Ventas",
      email: "rmartinez@nexo.com",
      phone: "555-1010",
      salary: 15000,
      hireDate: new Date("2020-03-15"),
      companyId: "default",
    },
  ],
  banks: [
    {
      name: "BBVA Bancomer",
      accountNumber: "0112345678",
      currency: "MXN",
      balance: 250000,
      type: "Cuenta de Cheques",
      companyId: "default",
    },
  ],
  prospects: [
    {
      company: "Tecnología XYZ S.A.",
      contact: "Juan Pérez",
      phone: "555-1111",
      email: "jperez@tecnologiaxyz.com",
      source: "referido",
      stage: "calificado",
      estimatedValue: 85000,
      companyId: "default",
    },
  ],
}

async function seedFirestore() {
  console.log("🌱 Iniciando seed de Firestore...")

  try {
    // Seed each collection
    for (const [collectionName, items] of Object.entries(sampleData)) {
      console.log(`📦 Seeding ${collectionName}...`)

      for (const item of items) {
        const docRef = await addDoc(collection(db, collectionName), {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        console.log(`  ✓ Added ${collectionName} document: ${docRef.id}`)
      }
    }

    console.log("✅ Seed completado exitosamente!")
  } catch (error) {
    console.error("❌ Error durante el seed:", error)
    throw error
  }
}

// Run seed
seedFirestore()
  .then(() => {
    console.log("🎉 Proceso finalizado")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Error fatal:", error)
    process.exit(1)
  })
