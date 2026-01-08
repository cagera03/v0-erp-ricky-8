/**
 * @deprecated Use lib/firestore.ts and hooks/use-firestore.ts instead
 * This file is kept for backward compatibility during migration
 */

type DataStore = {
  banks: any[]
  clients: any[]
  suppliers: any[]
  products: any[]
  orders: any[]
  sales: any[]
  employees: any[]
  accounts: any[]
  prospects: any[]
  quotations: any[]
  documents: any[]
  invoices: any[]
  requisitions: any[]
  attributes: any[]
  serviceOrders: any[]
}

const STORAGE_KEY = "nexo-erp-data"

const defaultData: DataStore = {
  banks: [],
  clients: [],
  suppliers: [],
  products: [],
  orders: [],
  sales: [],
  employees: [],
  accounts: [],
  prospects: [],
  quotations: [],
  documents: [],
  invoices: [],
  requisitions: [],
  attributes: [],
  serviceOrders: [],
}

// Get all data from storage
export function getStorageData(): DataStore {
  if (typeof window === "undefined") return defaultData

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : defaultData
  } catch (error) {
    console.error("[Storage] Error reading from localStorage:", error)
    return defaultData
  }
}

// Save all data to storage
export function setStorageData(data: DataStore): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("[Storage] Error writing to localStorage:", error)
  }
}

// Generic CRUD operations
export function getItems<T>(collection: keyof DataStore): T[] {
  const data = getStorageData()
  const items = data[collection] || []
  // Filter out null, undefined, and non-object values
  return items.filter((item: any) => item && typeof item === "object") as T[]
}

export function addItem<T extends { id: string | number }>(collection: keyof DataStore, item: T): T {
  const data = getStorageData()
  const items = data[collection] || []

  // Generate ID if not provided
  if (!item.id) {
    item.id = `${collection}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  data[collection] = [...items, item]
  setStorageData(data)
  return item
}

export function updateItem<T extends { id: string | number }>(
  collection: keyof DataStore,
  id: string | number,
  updates: Partial<T>,
): T | null {
  const data = getStorageData()
  const items = data[collection] || []
  const index = items.findIndex((item: any) => item?.id === id)

  if (index === -1) return null

  const updatedItem = { ...items[index], ...updates }
  items[index] = updatedItem
  data[collection] = items
  setStorageData(data)
  return updatedItem as T
}

export function deleteItem(collection: keyof DataStore, id: string | number): boolean {
  const data = getStorageData()
  const items = data[collection] || []
  const newItems = items.filter((item: any) => item?.id !== id)

  if (items.length === newItems.length) return false

  data[collection] = newItems
  setStorageData(data)
  return true
}

// Initialize with mock data if empty (deprecated - use Firestore seed script instead)
export function initializeMockData(): void {
  console.warn(
    "[Storage] initializeMockData is deprecated. Use Firestore for data persistence. This is only for backward compatibility.",
  )
  // Keep empty or minimal implementation
}
