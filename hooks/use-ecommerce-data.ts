"use client"

import { useState, useEffect } from "react"
import { where, Timestamp } from "firebase/firestore"
import { COLLECTIONS, subscribeToCollection, addItem, updateItem, deleteItem } from "@/lib/firestore"
import type { EcommerceProduct, EcommerceOrder, ProductReview, Promotion } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

export function useEcommerceData() {
  const { user, companyId } = useAuth()
  const [products, setProducts] = useState<EcommerceProduct[]>([])
  const [orders, setOrders] = useState<EcommerceOrder[]>([])
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  const userId = user?.uid || ""

  const safeProducts = Array.isArray(products) ? products : []
  const safeOrders = Array.isArray(orders) ? orders : []
  const safeReviews = Array.isArray(reviews) ? reviews : []
  const safePromotions = Array.isArray(promotions) ? promotions : []

  useEffect(() => {
    console.log("[v0] useEcommerceData - companyId:", companyId, "userId:", userId)

    if (!companyId || !userId) {
      console.log("[v0] useEcommerceData - No companyId or userId, skipping subscriptions")
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribers = [
      subscribeToCollection<EcommerceProduct>(
        COLLECTIONS.ecommerceProducts,
        (data) => {
          console.log("[v0] useEcommerceData - Products updated:", data.length)
          setProducts(data)
        },
        [where("companyId", "==", companyId)],
      ),
      subscribeToCollection<EcommerceOrder>(
        COLLECTIONS.ecommerceOrders,
        (data) => {
          console.log("[v0] useEcommerceData - Orders updated:", data.length)
          setOrders(data)
        },
        [where("companyId", "==", companyId)],
      ),
      subscribeToCollection<ProductReview>(
        COLLECTIONS.productReviews,
        (data) => {
          console.log("[v0] useEcommerceData - Reviews updated:", data.length)
          setReviews(data)
        },
        [where("companyId", "==", companyId)],
      ),
      subscribeToCollection<Promotion>(
        COLLECTIONS.promotions,
        (data) => {
          console.log("[v0] useEcommerceData - Promotions updated:", data.length)
          setPromotions(data)
        },
        [where("companyId", "==", companyId)],
      ),
    ]

    setLoading(false)

    return () => {
      console.log("[v0] useEcommerceData - Cleaning up subscriptions")
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [companyId, userId])

  const productosPublicados = safeProducts.filter((p) => p.publicado).length
  const ordenesPendientes = safeOrders.filter(
    (o) => o.estadoPedido === "pendiente" || o.estadoPedido === "confirmado",
  ).length

  const ventasDelMes = safeOrders
    .filter((o) => {
      if (!o.fechaPedido) return false
      const orderDate = o.fechaPedido instanceof Timestamp ? o.fechaPedido.toDate() : new Date(o.fechaPedido)
      const now = new Date()
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0)

  const reviewsPendientes = safeReviews.filter((r) => r.estado === "pendiente").length

  const createProduct = async (product: Omit<EcommerceProduct, "id">) => {
    try {
      if (!companyId || !userId) {
        toast({ title: "Error", description: "No hay sesión activa", variant: "destructive" })
        return null
      }

      const newProduct = await addItem<EcommerceProduct>(COLLECTIONS.ecommerceProducts, {
        ...product,
        companyId,
        userId,
        publicado: product.publicado ?? true,
        disponible: product.disponible ?? true,
        destacado: product.destacado ?? false,
        calificacionPromedio: 0,
        numeroReviews: 0,
        imagenes: product.imagenes || [],
        etiquetas: product.etiquetas || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: "active",
      })

      toast({ title: "Producto creado", description: "El producto se ha publicado correctamente" })
      return newProduct
    } catch (error) {
      console.error("[v0] Error creating product:", error)
      toast({ title: "Error", description: "No se pudo crear el producto", variant: "destructive" })
      return null
    }
  }

  const updateProduct = async (id: string, updates: Partial<EcommerceProduct>) => {
    try {
      await updateItem<EcommerceProduct>(COLLECTIONS.ecommerceProducts, id, {
        ...updates,
        updatedAt: Timestamp.now(),
      })
      toast({ title: "Producto actualizado", description: "Los cambios se han guardado" })
    } catch (error) {
      console.error("[v0] Error updating product:", error)
      toast({ title: "Error", description: "No se pudo actualizar el producto", variant: "destructive" })
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      await deleteItem(COLLECTIONS.ecommerceProducts, id)
      toast({ title: "Producto eliminado", description: "El producto se ha eliminado correctamente" })
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      toast({ title: "Error", description: "No se pudo eliminar el producto", variant: "destructive" })
    }
  }

  const updateOrderStatus = async (
    id: string,
    estadoPedido: EcommerceOrder["estadoPedido"],
    estadoPago?: EcommerceOrder["estadoPago"],
  ) => {
    try {
      const updates: Partial<EcommerceOrder> = {
        estadoPedido,
        updatedAt: Timestamp.now(),
      }
      if (estadoPago) updates.estadoPago = estadoPago
      if (estadoPedido === "enviado") updates.fechaEnvio = Timestamp.now()
      if (estadoPedido === "entregado") updates.fechaEntrega = Timestamp.now()

      await updateItem<EcommerceOrder>(COLLECTIONS.ecommerceOrders, id, updates)
      toast({ title: "Pedido actualizado", description: "El estado se ha actualizado correctamente" })
    } catch (error) {
      console.error("[v0] Error updating order:", error)
      toast({ title: "Error", description: "No se pudo actualizar el pedido", variant: "destructive" })
    }
  }

  const approveReview = async (id: string, approved: boolean) => {
    try {
      await updateItem<ProductReview>(COLLECTIONS.productReviews, id, {
        estado: approved ? "aprobado" : "rechazado",
        updatedAt: Timestamp.now(),
      })
      toast({ title: "Reseña actualizada", description: approved ? "Reseña aprobada" : "Reseña rechazada" })
    } catch (error) {
      console.error("[v0] Error updating review:", error)
      toast({ title: "Error", description: "No se pudo actualizar la reseña", variant: "destructive" })
    }
  }

  return {
    products: safeProducts,
    orders: safeOrders,
    reviews: safeReviews,
    promotions: safePromotions,
    loading,
    productosPublicados,
    ordenesPendientes,
    ventasDelMes,
    reviewsPendientes,
    createProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    approveReview,
  }
}
