"use client"

import { useMemo } from "react"
import { useFirestore } from "@/hooks/use-firestore"
import { useAuth } from "@/lib/auth-context"
import type {
  ProductAttribute,
  ProductCategory,
  ProductAttributeAssignment,
  ProductVariant,
  Product,
} from "@/lib/types"

export function useAttributesData() {
  const { user } = useAuth()
  const companyId = user?.companyId || "default"

  // Fetch all collections
  const {
    items: attributes,
    loading: attributesLoading,
    create: createAttribute,
    update: updateAttribute,
    remove: removeAttribute,
  } = useFirestore<ProductAttribute>("productAttributes", [], true)

  const {
    items: categories,
    loading: categoriesLoading,
    create: createCategory,
    update: updateCategory,
    remove: removeCategory,
  } = useFirestore<ProductCategory>("categories", [], true)

  const {
    items: assignments,
    loading: assignmentsLoading,
    create: createAssignment,
    update: updateAssignment,
    remove: removeAssignment,
  } = useFirestore<ProductAttributeAssignment>("productAttributeAssignments", [], true)

  const {
    items: variants,
    loading: variantsLoading,
    create: createVariant,
    update: updateVariant,
    remove: removeVariant,
  } = useFirestore<ProductVariant>("productVariants", [], true)

  const { items: products, loading: productsLoading } = useFirestore<Product>("products", [], true)

  const loading = attributesLoading || categoriesLoading || assignmentsLoading || variantsLoading || productsLoading

  // Calculate KPIs
  const stats = useMemo(() => {
    const activeAttributes = attributes.filter((attr) => attr.activo).length
    const productsWithAttributes = new Set(assignments.map((a) => a.productoId)).size
    const totalVariants = variants.length
    const activeCategories = categories.filter((cat) => cat.activo).length

    return {
      activeAttributes: activeAttributes || 0,
      productsWithAttributes: productsWithAttributes || 0,
      totalVariants: totalVariants || 0,
      activeCategories: activeCategories || 0,
    }
  }, [attributes, assignments, variants, categories])

  // Utility: Generate variants for a product
  const generateVariants = async (productId: string) => {
    const productAssignments = assignments.filter(
      (a) => a.productoId === productId && a.generarVariantes && a.valoresSeleccionados.length > 0,
    )

    if (productAssignments.length === 0) {
      return []
    }

    const product = products.find((p) => p.id === productId)
    if (!product) return []

    // Generate all combinations
    const generateCombinations = (
      attrs: ProductAttributeAssignment[],
      index = 0,
      current: Record<string, string> = {},
    ): Record<string, string>[] => {
      if (index >= attrs.length) {
        return [current]
      }

      const attr = attrs[index]
      const combinations: Record<string, string>[] = []

      for (const value of attr.valoresSeleccionados) {
        const newCurrent = { ...current, [attr.atributoNombre]: value }
        combinations.push(...generateCombinations(attrs, index + 1, newCurrent))
      }

      return combinations
    }

    const combinations = generateCombinations(productAssignments)

    // Create variants
    const newVariants: ProductVariant[] = []
    for (const combo of combinations) {
      const variantName = `${product.name} ${Object.values(combo).join(" ")}`
      const sku = `${product.id}-${Object.values(combo)
        .map((v) => v.substring(0, 2).toUpperCase())
        .join("")}`

      // Check if variant already exists
      const exists = variants.some(
        (v) => v.productoId === productId && JSON.stringify(v.combinacionAtributos) === JSON.stringify(combo),
      )

      if (!exists) {
        const variant: Omit<ProductVariant, "id"> = {
          productoId: productId, // Declared variable here
          productoNombre: product.name,
          sku,
          nombre: variantName,
          combinacionAtributos: combo,
          precio: product.price,
          costo: product.cost,
          stock: 0,
          activo: true,
          companyId,
        }

        const created = await createVariant(variant)
        newVariants.push(created)
      }
    }

    return newVariants
  }

  return {
    attributes,
    categories,
    assignments,
    variants,
    products,
    stats,
    loading,
    // Attribute operations
    createAttribute,
    updateAttribute,
    removeAttribute,
    // Category operations
    createCategory,
    updateCategory,
    removeCategory,
    // Assignment operations
    createAssignment,
    updateAssignment,
    removeAssignment,
    // Variant operations
    createVariant,
    updateVariant,
    removeVariant,
    generateVariants,
  }
}
