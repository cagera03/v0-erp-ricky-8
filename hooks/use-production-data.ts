"use client"

import { useMemo } from "react"
import { useFirestore } from "./use-firestore"
import { COLLECTIONS } from "@/lib/firestore"
import type {
  ProductionOrder,
  ProductFormula,
  MaterialPlanning,
  QualityCertificate,
  ProductionResult,
} from "@/lib/types"
import { orderBy } from "firebase/firestore"

export function useProductionData() {
  const {
    items: orders,
    loading: loadingOrders,
    create: createOrder,
    update: updateOrder,
    remove: removeOrder,
  } = useFirestore<ProductionOrder>(COLLECTIONS.productionOrders, [orderBy("startDate", "desc")], true)

  const {
    items: formulas,
    loading: loadingFormulas,
    create: createFormula,
    update: updateFormula,
  } = useFirestore<ProductFormula>(COLLECTIONS.productFormulas, [orderBy("productName", "asc")], true)

  const {
    items: materials,
    loading: loadingMaterials,
    update: updateMaterialPlanning,
  } = useFirestore<MaterialPlanning>(COLLECTIONS.materialPlanning, [orderBy("material", "asc")], true)

  const {
    items: qualityCerts,
    loading: loadingQuality,
    create: createQualityCert,
    update: updateQualityCert,
  } = useFirestore<QualityCertificate>(COLLECTIONS.qualityCertificates, [orderBy("inspectionDate", "desc")], true)

  const {
    items: results,
    loading: loadingResults,
    create: createResult,
  } = useFirestore<ProductionResult>(COLLECTIONS.productionResults, [orderBy("productionDate", "desc")], true)

  const loading = loadingOrders || loadingFormulas || loadingMaterials || loadingQuality || loadingResults

  // Calculate metrics
  const ordenesActivas = useMemo(() => {
    return (orders || []).filter((o) => o.status === "pending" || o.status === "in_process").length
  }, [orders])

  const enProduccion = useMemo(() => {
    return (orders || []).filter((o) => o.status === "in_process").length
  }, [orders])

  const eficienciaPromedio = useMemo(() => {
    if (!results || results.length === 0) return 0
    const totalEfficiency = (results || []).reduce((sum, r) => sum + (r.efficiency || 0), 0)
    return Math.round(totalEfficiency / results.length)
  }, [results])

  const materialesFaltantes = useMemo(() => {
    return (materials || []).filter((m) => m.status === "critical" || m.status === "pending").length
  }, [materials])

  return {
    orders: orders || [],
    formulas: formulas || [],
    materials: materials || [],
    qualityCertificates: qualityCerts || [],
    results: results || [],
    createOrder,
    updateOrder,
    removeOrder,
    createFormula,
    updateFormula,
    createQualityCert,
    updateQualityCert,
    updateMaterialPlanning,
    createResult,
    ordenesActivas,
    enProduccion,
    eficienciaPromedio,
    materialesFaltantes,
    loading,
  }
}
