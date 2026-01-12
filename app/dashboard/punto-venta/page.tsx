import { PosPage } from "@/components/pos-page"

export default function PuntoVentaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Punto de venta</h1>
        <p className="text-muted-foreground mt-2">Vende productos directamente desde el inventario.</p>
      </div>

      <PosPage />
    </div>
  )
}
