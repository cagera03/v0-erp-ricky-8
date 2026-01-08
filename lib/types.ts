import type { Timestamp } from "firebase/firestore"

// Base interface for all documents
export interface BaseDocument {
  id: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
  companyId?: string
}

// Orders
export interface Order extends BaseDocument {
  customer: string
  customerEmail?: string
  product: string
  quantity: number
  total: number
  status: "pending" | "processing" | "completed" | "cancelled"
  date: Timestamp | string
  deliveryDate?: Timestamp | string
  items?: OrderItem[]
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

// Products
export interface Product extends BaseDocument {
  sku: string
  name: string
  description?: string
  category?: string

  // Unit configuration
  baseUnit: string // e.g., "KG", "PZA", "LT"
  purchaseUnit?: string // e.g., "CAJA", "LOTE", "TARIMA"
  unitsPerPackage: number // How many base units per purchase unit (e.g., 1 caja = 4 bidones de 20kg = 80kg)

  // Pricing (in base units)
  price: number
  cost: number
  currency: "MXN" | "USD" | "EUR"

  // Inventory control
  trackInventory: boolean
  trackingType: "ninguno" | "lote" | "serie"
  requiresExpiry: boolean // If true, must capture expiry date (not calculate from days)

  // No stock field - inventory is ledger-based
  minStock?: number
  maxStock?: number
  reorderPoint?: number

  // Status
  active: boolean

  // Metadata
  barcode?: string
  weight?: number
  dimensions?: string
  imageUrl?: string
  tags?: string[]
  notes?: string
}

// Product Attributes and Variants System
export interface ProductAttribute extends BaseDocument {
  nombre: string
  tipo: "seleccion" | "numerico" | "texto" | "booleano" | "color"
  descripcion?: string
  valores: AttributeValue[] // For selection type
  activo: boolean
  orden?: number
  categoriaId?: string
  categoriaNombre?: string
  productosConAtributo?: number // Calculated
}

export interface AttributeValue {
  id: string
  valor: string
  hexColor?: string // For color type
  orden?: number
  activo: boolean
}

// Category for organizing attributes
export interface ProductCategory extends BaseDocument {
  nombre: string
  descripcion?: string
  imagen?: string
  orden?: number
  activo: boolean
  atributoIds?: string[] // Attributes linked to this category
}

// Mapping: Products → Attributes
export interface ProductAttributeAssignment extends BaseDocument {
  productoId: string
  productoNombre: string
  atributoId: string
  atributoNombre: string
  atributoTipo: string
  valoresSeleccionados: string[] // Selected values for this product
  generarVariantes: boolean // Whether to auto-generate variants
}

// Product Variants (SKU combinations)
export interface ProductVariant extends BaseDocument {
  productoId: string
  productoNombre: string
  sku: string
  nombre: string // e.g., "Playera Roja M"
  combinacionAtributos: Record<string, string> // e.g., {color: "Rojo", talla: "M"}
  precio: number
  costo: number
  stock: number
  imagenes?: string[]
  activo: boolean
  codigoBarras?: string
}

// Customers
export interface Customer extends BaseDocument {
  nombre: string
  rfc?: string
  email: string
  telefono: string
  direccion?: string
  ciudad?: string
  estado?: string
  codigoPostal?: string
  limiteCredito: number
  saldo: number // Calculated from accountsReceivable
  diasCredito: number
  estado: "activo" | "inactivo" | "suspendido"
  tipoCliente: "minorista" | "mayorista" | "distribuidor" | "vip"
  descuentoDefault?: number
  vendedorAsignado?: string
  fechaRegistro: Timestamp | string
  ultimaCompra?: Timestamp | string
  totalCompras?: number
  notas?: string
}

// Purchases / Production Costs
export interface Purchase extends BaseDocument {
  supplierId?: string
  supplierName: string
  description: string
  amount: number
  date: Timestamp | string
  category: "raw_materials" | "supplies" | "production" | "other"
  status: "pending" | "completed" | "cancelled"
  invoiceNumber?: string
}

// Operating Expenses
export interface Expense extends BaseDocument {
  description: string
  amount: number
  date: Timestamp | string
  category: "rent" | "utilities" | "salaries" | "marketing" | "maintenance" | "other"
  status: "pending" | "paid"
  paymentMethod?: string
  invoiceNumber?: string
}

// Inventory Snapshots
export interface InventorySnapshot extends BaseDocument {
  period: string // Format: "YYYY-MM" for monthly snapshots
  periodStart: Timestamp | string
  periodEnd: Timestamp | string
  openingValue: number // Total inventory value at start of period
  closingValue: number // Total inventory value at end of period
  method: "fifo" | "lifo" | "average" // Costing method
  status: "draft" | "closed"
  notes?: string
}

// Financial Period Data (calculated)
export interface FinancialPeriod {
  periodStart: Date
  periodEnd: Date
  totalRevenue: number
  cogs: number
  grossProfit: number
  opex: number
  operatingProfit: number
  operatingMargin: number
}

// Bank Accounts
export interface BankAccount extends BaseDocument {
  banco: string // Bank name
  alias: string // Friendly name for the account
  numeroEnmascarado: string // Masked number (e.g., "****1234")
  numeroCompleto?: string // Full account number (encrypted)
  tipo: "cheques" | "inversion" | "ahorro" | "nomina"
  moneda: "MXN" | "USD" | "EUR"
  saldoInicial: number
  saldoActual: number
  estado: "activa" | "inactiva" | "suspendida"
  clabe?: string
  sucursal?: string
  ejecutivo?: string
  notas?: string
}

// Bank Transactions
export interface BankTransaction extends BaseDocument {
  cuentaId: string // Reference to BankAccount
  tipo: "ingreso" | "egreso" | "transferencia"
  concepto: string
  monto: number
  fecha: Timestamp | string
  referencia?: string
  origen?: string // For transfers
  destino?: string // For transfers
  categoria?: string
  conciliado: boolean
  conciliadoFecha?: Timestamp | string
  notas?: string
}

// Checks
export interface Check extends BaseDocument {
  numero: string
  cuentaId: string // Reference to BankAccount
  beneficiario: string
  monto: number
  fechaEmision: Timestamp | string
  fechaCobro?: Timestamp | string
  concepto: string
  estado: "emitido" | "entregado" | "cobrado" | "cancelado"
  notas?: string
}

// Bank Transfers
export interface BankTransfer extends BaseDocument {
  tipo: "interna" | "externa" | "spei" | "internacional"
  cuentaOrigenId: string
  cuentaDestinoId?: string // For internal transfers
  beneficiario: string
  clabe?: string
  banco?: string
  monto: number
  moneda: "MXN" | "USD" | "EUR"
  fechaProgramada: Timestamp | string
  fechaEjecutada?: Timestamp | string
  referencia?: string
  concepto: string
  estado: "programada" | "procesando" | "completada" | "fallida" | "cancelada"
  comision?: number
  layoutGenerado: boolean
  layoutUrl?: string // Link to generated file
  notas?: string
}

// Bank Statements (Estado de Cuenta)
export interface BankStatement extends BaseDocument {
  cuentaId: string
  periodo: string // YYYY-MM format
  fechaInicio: Timestamp | string
  fechaFin: Timestamp | string
  archivoUrl?: string // Storage link to uploaded CSV/PDF
  archivoNombre?: string
  saldoInicial: number
  saldoFinal: number
  totalIngresos: number
  totalEgresos: number
  estado: "procesando" | "conciliado" | "parcial"
  transaccionesConciliadas: number
  transaccionesPendientes: number
  diferencia: number
}

// Reconciliation Items
export interface ReconciliationItem extends BaseDocument {
  estadoCuentaId: string
  transaccionSistemaId?: string
  fecha: Timestamp | string
  concepto: string
  montoSistema: number
  montoBanco: number
  diferencia: number
  estado: "conciliado" | "pendiente" | "diferencia"
  notas?: string
}

// Cash Flow Projection
export interface CashFlowPeriod {
  periodo: string // Week/Month identifier
  fechaInicio: Date
  fechaFin: Date
  ingresosReales: number
  ingresosProyectados: number
  egresosReales: number
  egresosProyectados: number
  saldoInicial: number
  saldoFinal: number
  saldoProyectado: number
}

// CRM-specific types for complete customer management
// Leads / Prospects
export interface Lead extends BaseDocument {
  empresa: string
  contacto: string
  email: string
  telefono: string
  fuente: "web" | "referido" | "cold_call" | "evento" | "otro"
  etapa: "prospecto" | "contactado" | "calificado" | "propuesta" | "negociacion" | "cerrado" | "perdido"
  valorEstimado: number
  probabilidad: number // 0-100
  fechaCierre?: Timestamp | string
  notas?: string
  convertidoACliente: boolean
  clienteId?: string
}

// Customer Documents
export interface CustomerDocument extends BaseDocument {
  clienteId: string
  clienteNombre: string
  tipo: "cotizacion" | "pedido" | "remision" | "factura" | "nota_credito"
  folio: string
  fecha: Timestamp | string
  monto: number
  estado: "borrador" | "enviada" | "aceptada" | "rechazada" | "cancelada"
  items: DocumentItem[]
  archivoUrl?: string
  notas?: string
}

export interface DocumentItem {
  productoId?: string
  descripcion: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

// Accounts Receivable (Cuentas por Cobrar)
export interface AccountReceivable extends BaseDocument {
  clienteId: string
  clienteNombre: string
  documentoId?: string // Reference to invoice or document
  documentoFolio?: string
  monto: number
  montoOriginal: number
  montoPagado: number
  saldo: number
  fechaEmision: Timestamp | string
  fechaVencimiento: Timestamp | string
  estado: "pendiente" | "parcial" | "pagada" | "vencida"
  pagos: Payment[]
  notas?: string
}

export interface Payment {
  id: string
  fecha: Timestamp | string
  monto: number
  metodoPago: "efectivo" | "transferencia" | "cheque" | "tarjeta"
  referencia?: string
  cuentaBancariaId?: string
  chequeId?: string
  notas?: string
}

// CFDI (Mexican Electronic Invoices)
export interface CFDI extends BaseDocument {
  clienteId: string
  clienteNombre: string
  clienteRFC: string
  folio: string
  uuid?: string // After "timbrado"
  serie?: string
  fecha: Timestamp | string
  subtotal: number
  iva: number
  total: number
  moneda: "MXN" | "USD"
  tipoCambio?: number
  formaPago: string
  metodoPago: string
  usoCFDI: string
  items: CFDIItem[]
  estado: "pendiente" | "timbrada" | "cancelada"
  xmlUrl?: string
  pdfUrl?: string
  fechaTimbrado?: Timestamp | string
  fechaCancelacion?: Timestamp | string
  motivoCancelacion?: string
}

export interface CFDIItem {
  claveProdServ: string
  claveUnidad: string
  descripcion: string
  cantidad: number
  valorUnitario: number
  importe: number
  objetoImp: string
}

// Supplier and related types for complete procurement management
// Suppliers
export interface Supplier extends BaseDocument {
  nombre: string
  razonSocial: string
  rfc: string
  email: string
  telefono: string
  direccion?: string
  ciudad?: string
  estado?: string
  codigoPostal?: string
  pais: string
  contactoPrincipal: string
  cuentaBancaria?: string
  clabe?: string
  banco?: string
  diasCredito: number
  limiteCredito: number
  saldoPorPagar: number // Calculated from accountsPayable
  moneda: "MXN" | "USD" | "EUR"
  rating: number // 0-5
  estadoProveedor: "activo" | "inactivo" | "suspendido"
  categorias: string[] // Tags for categorization
  productosSuministrados: string[]
  comprasTotales: number
  ultimaCompra?: Timestamp | string | null
  leadTime?: number | null
  notas?: string
}

// Supplier Documents (invoices, contracts, quotations, etc.)
export interface SupplierDocument extends BaseDocument {
  proveedorId: string
  proveedorNombre: string
  tipo: "factura" | "contrato" | "cotizacion" | "orden" | "recepcion" | "otro"
  folio: string
  fecha: Timestamp | string
  monto?: number
  moneda: "MXN" | "USD" | "EUR"
  archivoUrl?: string // Storage link
  archivoNombre?: string
  estado: "activo" | "archivado" | "cancelado"
  notas?: string
}

// Supplier Products (catalog with pricing)
export interface SupplierProduct extends BaseDocument {
  proveedorId: string
  proveedorNombre: string
  productoId: string // Link to main product catalog
  sku: string
  nombre: string
  descripcion?: string

  // Supplier's product codes
  codigoProveedor?: string
  nombreProveedor?: string

  // Pricing
  precioBase: number
  monedaPrincipal: "MXN" | "USD" | "EUR"
  tiposCambio?: {
    usdToMxn: number
    eurToMxn: number
  }
  precios: {
    MXN?: number
    USD?: number
    EUR?: number
  }

  // Unit conversions
  unidadBase: string // e.g., "KG" - MUST match Product.baseUnit
  unidadCompra: string // e.g., "CAJA"
  unidadesPorEmpaque: number // e.g., 1 CAJA = 4 bidones × 20 KG = 80 KG

  almacenDestinoId?: string
  almacenDestinoNombre?: string

  // Tracking
  trackingType: "ninguno" | "lote" | "serie"
  requiresExpiry: boolean

  activo: boolean
  ultimaActualizacion: Timestamp | string
  notas?: string
  notasEntrega?: string
}

// Purchase Orders
export interface PurchaseOrder extends BaseDocument {
  folio: string
  proveedorId: string
  proveedorNombre: string
  fecha: Timestamp | string
  fechaEntrega: Timestamp | string
  subtotal: number
  iva: number
  total: number
  moneda: "MXN" | "USD" | "EUR"
  tolerancia: number // Percentage allowed variance
  estado: "borrador" | "autorizada" | "enviada" | "recibida_parcial" | "recibida_completa" | "cancelada"
  items: PurchaseOrderItem[]
  autorizadoPor?: string
  fechaAutorizacion?: Timestamp | string
  notas?: string
}

export interface PurchaseOrderItem {
  productoId?: string
  sku: string
  descripcion: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  cantidadRecibida: number
}

// Goods Receipts / Recepciones
export interface GoodsReceipt extends BaseDocument {
  folio: string
  ordenCompraId: string
  ordenCompraFolio: string
  proveedorId: string
  proveedorNombre: string
  fecha: Timestamp | string

  almacenId: string
  almacenNombre: string

  items: GoodsReceiptItem[]
  estado: "completa" | "parcial" | "devolucion"
  facturaVinculada: boolean
  facturaId?: string
  notas?: string
}

export interface GoodsReceiptItem {
  productoId: string
  sku: string
  descripcion: string

  // Ordering
  cantidadOrdenada: number // In purchase units
  cantidadRecibida: number // In purchase units
  unidadCompra: string // e.g., "CAJA"

  unidadBase: string // e.g., "KG"
  unidadesPorEmpaque: number // e.g., 80 KG per CAJA
  // cantidadBaseRecibida is calculated in the hook: cantidadRecibida × unidadesPorEmpaque

  // Pricing (per base unit)
  precioUnitario: number
  costoTotal: number // cantidadBaseRecibida × precioUnitario

  lote?: string
  fechaCaducidad?: Timestamp | string | null // User enters expiry date directly, not calculated

  // Quality
  notas?: string
}

// Accounts Payable (Cuentas por Pagar a Proveedores)
export interface AccountPayable extends BaseDocument {
  proveedorId: string
  proveedorNombre: string
  facturaProveedor: string // Supplier invoice number
  ordenCompraId?: string
  recepcionId?: string
  fecha: Timestamp | string
  fechaVencimiento: Timestamp | string
  montoOriginal: number
  montoPagado: number
  saldo: number
  moneda: "MXN" | "USD" | "EUR"
  estado: "pendiente" | "parcial" | "pagada" | "vencida"
  autorizada: boolean
  autorizadoPor?: string
  pagos: SupplierPayment[]
  notas?: string
}

export interface SupplierPayment {
  id: string
  fecha: Timestamp | string
  monto: number
  metodoPago: "efectivo" | "transferencia" | "cheque" | "tarjeta"
  referencia?: string
  cuentaBancariaId?: string
  chequeId?: string
  notas?: string
}

// Warehouses
export interface Warehouse extends BaseDocument {
  nombre: string
  codigo: string
  ubicacion: string
  ciudad?: string
  estado?: string
  codigoPostal?: string
  responsable?: string
  telefono?: string
  email?: string
  tipo: "principal" | "sucursal" | "bodega" | "transito"
  estado: "activo" | "inactivo" | "mantenimiento"
  capacidadM3?: number
  area?: number
  notas?: string
}

// Inventory Stock (by warehouse and product)
export interface InventoryStock extends BaseDocument {
  // Location
  almacenId: string
  almacenNombre: string

  // Product
  productoId: string
  productoNombre: string
  sku: string
  unidadBase: string

  // Lot tracking (if applicable)
  lote?: string | null
  serie?: string | null
  fechaCaducidad?: Timestamp | string | null

  // Quantity (calculated from movements ledger)
  cantidadActual: number // Sum of all movements for this almacen+producto+lote
  cantidadDisponible: number // Actual - Reserved
  cantidadReservada: number // Reserved by pending sales orders
  cantidadEnTransito: number // In transfer

  // Costing
  costoPromedio: number // Weighted average cost per base unit
  metodoValuacion: "promedio" | "PEPS" | "UEPS"
  valorTotal: number // cantidadActual × costoPromedio

  // Physical location
  ubicacionFisica?: string // e.g., "A-01", "Rack 5"

  // Reorder
  minimoStock?: number
  maximoStock?: number
  puntoReorden?: number

  // Last updated
  ultimaActualizacion: Timestamp | string
}

// Stock Movements (entrada, salida, ajuste)
export interface StockMovement extends BaseDocument {
  folio: string

  // Location
  almacenId: string
  almacenNombre: string

  // Product
  productoId: string
  productoNombre: string
  sku: string

  // Movement type
  tipo:
    | "entrada" // Generic entry
    | "salida" // Generic exit
    | "ajuste" // Adjustment from physical count
    | "recepcion_compra" // Purchase receipt
    | "devolucion_compra" // Purchase return
    | "venta" // Sale fulfillment
    | "devolucion_venta" // Sales return
    | "transferencia_salida" // Transfer out
    | "transferencia_entrada" // Transfer in
    | "produccion_consumo" // Production consumption
    | "produccion_salida" // Production output

  // Quantity (always in base units)
  unidadBase: string
  cantidad: number
  cantidadAnterior: number // Before this movement
  cantidadNueva: number // After this movement

  // Costing (per base unit)
  costoUnitario: number
  costoTotal: number

  // Timestamp
  fecha: Timestamp | string

  // Traceability - Source document references
  referencia?: string // Human-readable reference
  proveedorId?: string | null
  proveedorNombre?: string | null
  ordenCompraId?: string | null
  ordenCompraFolio?: string | null
  recepcionId?: string | null
  recepcionFolio?: string | null

  clienteId?: string | null
  clienteNombre?: string | null
  ordenVentaId?: string | null
  ordenVentaFolio?: string | null
  remisionId?: string | null
  remisionFolio?: string | null
  facturaId?: string | null
  facturaFolio?: string | null

  transferenciaId?: string | null
  transferenciaFolio?: string | null

  ordenProduccionId?: string | null
  ordenProduccionFolio?: string | null

  conteoFisicoId?: string | null
  conteoFisicoFolio?: string | null

  // Lot/serial tracking
  lote?: string | null
  serie?: string | null
  fechaCaducidad?: Timestamp | string | null

  // User who performed the movement
  usuarioId: string
  usuarioNombre: string

  // Additional info
  motivo: string
  notas?: string
}

// Warehouse Transfers
export interface WarehouseTransfer extends BaseDocument {
  folio: string
  almacenOrigenId: string
  almacenOrigenNombre: string
  almacenDestinoId: string
  almacenDestinoNombre: string
  productos: TransferItem[]
  fechaSolicitud: Timestamp | string
  fechaEnvio?: Timestamp | string
  fechaRecepcion?: Timestamp | string
  estado: "solicitada" | "aprobada" | "en_transito" | "recibida" | "cancelada"
  solicitadoPor: string
  aprobadoPor?: string
  recibidoPor?: string
  observaciones?: string
  motivoCancelacion?: string
}

export interface TransferItem {
  productoId: string
  sku: string
  nombre: string
  cantidadSolicitada: number
  cantidadEnviada?: number
  cantidadRecibida?: number
  costo: number
}

// Physical Inventory Counts
export interface PhysicalCount extends BaseDocument {
  folio: string
  almacenId: string
  almacenNombre: string
  fechaConteo: Timestamp | string
  fechaCierre?: Timestamp | string
  estado: "en_progreso" | "completado" | "ajustado"
  conteos: CountItem[]
  totalDiferencias: number
  valorDiferencias: number
  contadoPor: string
  supervisadoPor?: string
  notas?: string
}

export interface CountItem {
  productoId: string
  sku: string
  nombre: string
  cantidadSistema: number
  cantidadFisica?: number
  diferencia: number
  costo: number
  valorDiferencia: number
  ubicacion?: string
  ajusteAplicado: boolean
}

// Reorder Rules
export interface ReorderRule extends BaseDocument {
  almacenId: string
  productoId: string
  productoNombre: string
  sku: string
  minimoStock: number
  maximoStock: number
  puntoReorden: number
  cantidadOrden: number
  proveedorId?: string
  proveedorNombre?: string
  leadTime: number // Days
  activo: boolean
}

// Production-specific types
// Production Order - Main production scheduling
export interface ProductionOrder extends BaseDocument {
  folio: string // PROD-001
  customerOrderId?: string // Link to sales order
  productId: string
  productName: string
  quantity: number
  completed: number
  status: "pending" | "in_process" | "completed" | "on_hold" | "cancelled"
  priority: "low" | "normal" | "high" | "urgent"
  startDate: Timestamp | string
  endDate: Timestamp | string
  scheduledStart?: Timestamp | string
  scheduledEnd?: Timestamp | string
  assignedTo?: string[] // Worker IDs
  formulaId?: string
  batchNumber?: string
  notes?: string
  almacenOrigenId: string // Warehouse for raw materials
  almacenOrigenNombre: string
  almacenDestinoId: string // Warehouse for finished product
  almacenDestinoNombre: string
  materialsReserved: boolean // Materials reserved but not consumed
  materialsConsumed: boolean // Materials actually consumed
  finishedProductGenerated: boolean // Finished product added to inventory
  reservedMaterials?: ReservedMaterial[] // Track what was reserved
}

export interface ReservedMaterial {
  materialId: string
  materialName: string
  quantity: number
  unit: string
  lote?: string | null
  almacenId: string
  almacenNombre: string
  reservedAt: Timestamp | string
}

// Product Formula - Bill of Materials
export interface ProductFormula extends BaseDocument {
  productId: string
  productName: string
  sku: string
  version: number
  components: FormulaComponent[]
  laborCost: number
  manufacturingCost: number
  totalCost: number
  isActive: boolean
  createdBy?: string
  approvedBy?: string
  approvedDate?: Timestamp | string
  outputQuantity: number // How many units this formula produces
  outputUnit: string // Unit of the finished product
}

export interface FormulaComponent {
  materialId: string
  materialName: string
  sku: string
  quantity: number
  unit: string
  costPerUnit: number
  conversionFactor?: number // Convert between purchase/base units
}

// Material Planning - MRP calculations
export interface MaterialPlanning extends BaseDocument {
  material: string
  materialId: string
  sku: string
  available: number // Current stock available
  reserved: number // Reserved by production orders
  required: number // Needed for active production orders
  shortage: number // Calculated: required - (available - reserved)
  unit: string
  purchaseOrderId?: string
  status: "sufficient" | "pending" | "critical"
  lastUpdated: Timestamp | string
  supplierId?: string
  supplierName?: string
  leadTimeDays?: number
  suggestedOrderQuantity?: number
}

// Quality Certificate - Quality control records
export interface QualityCertificate extends BaseDocument {
  productId: string
  productName: string
  sku: string
  batchNumber: string
  productionOrderId: string
  productionOrderFolio: string
  inspectionDate: Timestamp | string
  inspector: string
  status: "approved" | "review" | "rejected"
  rating: number // 0-100
  defectsFound?: string[]
  specifications?: QualitySpecification[]
  notas?: string
  blocksClosure: boolean // If true, order cannot be completed
}

export interface QualitySpecification {
  id: string
  parameter: string
  expected: string
  measured: string
  passed: boolean
}

// Production Result - Production outcome tracking
export interface ProductionResult extends BaseDocument {
  productionOrderId: string
  orderNumber: string
  productName: string
  sku: string
  plannedQuantity: number
  producedQuantity: number
  secondQualityQuantity: number
  wasteQuantity: number
  efficiency: number // (produced / planned) * 100
  yield: number // ((produced + secondQuality) / (produced + secondQuality + waste)) * 100
  productionDate: Timestamp | string
  startTime?: Timestamp | string
  endTime?: Timestamp | string
  durationMinutes?: number
  notes?: string
  batchNumber: string
  almacenDestinoId: string
  almacenDestinoNombre: string
  materialsUsed: MaterialUsage[]
  qualityCertificateId?: string
}

export interface MaterialUsage {
  materialId: string
  materialName: string
  sku: string
  quantityUsed: number
  unit: string
  lote?: string | null
  costoUnitario: number
  costoTotal: number
  almacenOrigenId: string
  movementId: string // Link to stockMovement
}

// Customer Service-specific types for complete service management
// Service Tickets
export interface ServiceTicket extends BaseDocument {
  numero: string // TKT-001
  clienteId?: string
  clienteNombre: string
  canal: "whatsapp" | "email" | "telefono" | "portal" | "presencial"
  asunto: string
  descripcion: string
  categoria: string
  subcategoria?: string
  prioridad: "baja" | "media" | "alta" | "critica"
  estado: "abierto" | "en_proceso" | "en_espera" | "resuelto" | "cerrado"
  slaObjetivo: number // Hours
  fechaCreacion: Timestamp | string
  fechaUltimaActualizacion: Timestamp | string
  fechaPrimeraRespuesta?: Timestamp | string
  fechaResolucion?: Timestamp | string
  fechaCierre?: Timestamp | string
  agenteAsignado?: string
  departamento?: string
  etiquetas: string[]
  adjuntos: TicketAttachment[]
  notasInternas: TicketNote[]
  historial: TicketActivity[]
  calificacion?: number // 1-5 stars (CSAT)
  comentarioCliente?: string
  tiempoPrimeraRespuesta?: number // Minutes
  tiempoResolucion?: number // Minutes
  slaViolado: boolean
}

export interface TicketAttachment {
  id: string
  nombre: string
  url: string
  tipo: string
  tamanio: number
  fecha: Timestamp | string
  subidoPor: string
}

export interface TicketNote {
  id: string
  fecha: Timestamp | string
  autor: string
  contenido: string
  interno: boolean
}

export interface TicketActivity {
  id: string
  fecha: Timestamp | string
  usuario: string
  tipo: "creacion" | "actualizacion" | "comentario" | "asignacion" | "estado" | "resolucion" | "calificacion"
  descripcion: string
  campoModificado?: string
  valorAnterior?: string
  valorNuevo?: string
}

export interface ServiceMetrics {
  totalTickets: number
  ticketsAbiertos: number
  ticketsEnProceso: number
  ticketsResueltos: number
  tiempoPromedioRespuesta: number // Hours
  tiempoPromedioResolucion: number // Hours
  satisfaccionPromedio: number // 1-5
  cumplimientoSLA: number // Percentage
  distribucionCanales: Record<string, number>
  distribucionCategorias: Record<string, number>
  distribucionSatisfaccion: Record<number, number> // Rating count
}

// Field Services - Complete on-site service management with geolocation
export interface FieldServiceOrder extends BaseDocument {
  folio: string // SRV-001
  clienteId: string
  clienteNombre: string
  contacto: string
  telefono: string
  direccion: string
  ciudad?: string
  estado?: string
  codigoPostal?: string
  latitud: number
  longitud: number
  tipo: "mantenimiento" | "reparacion" | "instalacion" | "inspeccion" | "emergencia"
  categoria: string
  descripcion: string
  prioridad: "baja" | "media" | "alta" | "urgente"
  estado: "nuevo" | "asignado" | "en_ruta" | "en_sitio" | "finalizado" | "cancelado"
  slaHoras: number
  fechaCreacion: Timestamp | string
  fechaProgramada: Timestamp | string
  ventanaInicio?: string // e.g., "08:00"
  ventanaFin?: string // e.g., "12:00"
  tecnicoId?: string
  tecnicoNombre?: string
  checkIn?: Timestamp | string
  checkOut?: Timestamp | string
  duracionMinutos?: number
  evidencias: ServiceEvidence[]
  firmaCliente?: string
  checklist: ChecklistItem[]
  refacciones: RefaccionUsada[]
  costoServicio: number
  costoRefacciones: number
  costoTotal: number
  notas: string
  bitacora: ServiceLogEntry[]
}

export interface ServiceEvidence {
  id: string
  tipo: "foto_antes" | "foto_durante" | "foto_despues" | "documento"
  url: string
  descripcion?: string
  fecha: Timestamp | string
}

export interface ChecklistItem {
  id: string
  descripcion: string
  completado: boolean
  observaciones?: string
}

export interface RefaccionUsada {
  id: string
  productoId?: string
  descripcion: string
  cantidad: number
  costoUnitario: number
  costoTotal: number
}

export interface ServiceLogEntry {
  id: string
  fecha: Timestamp | string
  usuario: string
  accion: string
  detalles?: string
}

// Field Service Technicians
export interface FieldTechnician extends BaseDocument {
  nombre: string
  email: string
  telefono: string
  especialidades: string[]
  zona: string
  disponibilidad: "disponible" | "en_servicio" | "no_disponible" | "descanso"
  rating: number // 0-5
  totalServicios: number
  serviciosCompletados: number
  unidad?: string // Vehicle info
  placas?: string
  latitudActual?: number
  longitudActual?: number
  ultimaActualizacion?: Timestamp | string
  certificaciones?: string[]
  nivelExperiencia: "junior" | "mid" | "senior"
}

// Real-time Location Tracking
export interface TechnicianLocation extends BaseDocument {
  tecnicoId: string
  tecnicoNombre: string
  latitud: number
  longitud: number
  precision?: number
  velocidad?: number
  rumbo?: number
  timestamp: Timestamp | string
  servicioActualId?: string
}

export interface FieldServiceMetrics {
  serviciosActivos: number
  tecnicosEnCampo: number
  serviciosDelMes: number
  tiempoPromedioHoras: number
  serviciosPorEstado: Record<string, number>
  serviciosPorPrioridad: Record<string, number>
  eficienciaTecnicos: number // Percentage
  cumplimientoSLA: number // Percentage
}

// Accounting-specific types for ledger accounts and journal entries
// Accounting - Ledger Accounts (Chart of Accounts / Catálogo de Cuentas)
export interface LedgerAccount extends BaseDocument {
  codigo: string // Account code (e.g., "1000", "1100")
  nombre: string // Account name
  tipo: "Activo" | "Pasivo" | "Capital" | "Ingresos" | "Egresos" | "Costos"
  nivel: number // Hierarchy level (1, 2, 3)
  cuentaPadre?: string // Parent account ID for hierarchy
  saldo: number // Current balance
  naturaleza: "deudora" | "acreedora" // Normal balance type
  acumulaSaldo: boolean // Whether it accumulates balance or is just a header
  activa: boolean // Is account active
  movimientos: number // Number of transactions
}

// Journal Entries (Pólizas)
export interface JournalEntry extends BaseDocument {
  folio: string // Entry number
  tipo: "Diario" | "Ingresos" | "Egresos" | "Ajuste"
  fecha: Timestamp | string
  concepto: string // Description
  referencia?: string // External reference (invoice, document, etc.)
  estado: "borrador" | "autorizada" | "cancelada"
  autorizadoPor?: string
  fechaAutorizacion?: Timestamp | string
  movimientos: JournalMovement[] // Individual debit/credit movements
  totalCargos: number // Total debits
  totalAbonos: number // Total credits
  diferencia: number // Should be 0 for balanced entry
  notas?: string
}

export interface JournalMovement {
  cuentaId: string
  cuentaCodigo: string
  cuentaNombre: string
  tipo: "cargo" | "abono" // debit or credit
  monto: number
  referencia?: string
  notas?: string
}

// Budget (Presupuestos)
export interface Budget extends BaseDocument {
  nombre: string
  año: number
  estado: "activo" | "cerrado" | "borrador"
  cuentas: BudgetLine[]
  totalPresupuestado: number
}

export interface BudgetLine {
  cuentaId: string
  cuentaCodigo: string
  cuentaNombre: string
  enero: number
  febrero: number
  marzo: number
  abril: number
  mayo: number
  junio: number
  julio: number
  agosto: number
  septiembre: number
  octubre: number
  noviembre: number
  diciembre: number
  total: number
}

// Comprehensive Sales Order Types
export interface SalesOrderLine {
  id: string
  type: "product" | "section" | "note"
  productId?: string
  productName?: string
  description: string
  quantity?: number
  unit?: string
  unitPrice?: number
  tax?: number // Percentage (e.g., 16 for 16% IVA)
  taxAmount?: number // Calculated tax amount
  discount?: number // Percentage or fixed amount
  discountAmount?: number
  subtotal?: number // quantity * unitPrice
  total?: number // subtotal + tax - discount
  order: number // Sort order
}

export interface SalesOrder extends BaseDocument {
  // Order identification
  type: "quotation" | "order"
  folio: string

  // Customer
  customerId: string
  customerName: string

  // Status workflow: draft → confirmed → in_progress → delivered → invoiced
  status: "draft" | "confirmed" | "in_progress" | "delivered" | "invoiced" | "cancelled"

  // Items
  items: SalesOrderItem[]

  // Pricing
  currency: "MXN" | "USD" | "EUR"
  subtotal: number
  tax: number
  discount: number
  shipping: number
  total: number

  // Fulfillment
  almacenId?: string // Warehouse to fulfill from
  almacenNombre?: string
  metodoValuacion: "PEPS" | "promedio" // How to pick inventory lots

  // Delivery
  deliveryAddress?: string
  deliveryDate?: Timestamp | string
  deliveryNotes?: string

  // References
  remisionId?: string | null // Delivery note
  remisionFolio?: string | null
  facturaId?: string | null // Invoice
  facturaFolio?: string | null

  // Timestamps
  orderDate: Timestamp | string
  confirmedDate?: Timestamp | string
  deliveredDate?: Timestamp | string
  invoicedDate?: Timestamp | string

  // Users
  createdBy: string
  confirmedBy?: string

  notes?: string
}

export interface SalesOrderItem {
  productoId: string
  sku: string
  nombre: string
  descripcion?: string

  // Quantity
  cantidad: number
  unidad: string

  // Pricing
  precioUnitario: number
  descuento: number
  subtotal: number

  // Fulfillment tracking
  cantidadEntregada: number
  cantidadPendiente: number

  // Lot assignments (for FIFO/traceability)
  lotesAsignados?: Array<{
    lote: string
    almacenId: string
    cantidad: number
    costoUnitario: number
    fechaCaducidad?: Timestamp | string
  }>
}

export interface Delivery extends BaseDocument {
  folio: string

  // References
  ordenVentaId: string
  ordenVentaFolio: string
  clienteId: string
  clienteNombre: string

  // Status
  estado: "preparando" | "lista" | "en_transito" | "entregada" | "cancelada"

  // Items with lot details
  items: DeliveryItem[]

  // Delivery details
  direccionEntrega: string
  fechaEntrega: Timestamp | string
  fechaEntregaReal?: Timestamp | string
  transportista?: string
  guiaRastreo?: string

  // Warehouse
  almacenId: string
  almacenNombre: string

  // Users
  preparadoPor?: string
  entregadoPor?: string
  recibidoPor?: string

  notas?: string
}

export interface DeliveryItem {
  productoId: string
  sku: string
  nombre: string
  cantidad: number
  unidad: string

  // Lot traceability
  lote?: string
  serie?: string
  fechaCaducidad?: Timestamp | string

  // Which stock movement this relates to
  movimientoId?: string
}

export interface Invoice extends BaseDocument {
  folio: string
  serie?: string

  // References
  ordenVentaId?: string
  ordenVentaFolio?: string
  remisionId?: string
  remisionFolio?: string
  clienteId: string
  clienteNombre: string
  clienteRFC?: string

  // Items
  items: InvoiceItem[]

  // Amounts
  subtotal: number
  iva: number
  descuento: number
  total: number
  moneda: "MXN" | "USD" | "EUR"

  // Payment
  formaPago: string
  metodoPago: string
  condicionesPago?: string
  diasCredito?: number
  fechaVencimiento?: Timestamp | string

  // Payment status
  estadoPago: "pendiente" | "parcial" | "pagada" | "vencida"
  montoPagado: number
  saldo: number

  // CFDI (Mexico)
  usoCFDI?: string
  uuid?: string
  fechaTimbrado?: Timestamp | string
  xmlUrl?: string
  pdfUrl?: string

  // Status
  estado: "borrador" | "timbrada" | "enviada" | "pagada" | "cancelada"

  // Dates
  fecha: Timestamp | string
  fechaEmision: Timestamp | string

  notas?: string
}

export interface InvoiceItem {
  productoId?: string
  claveProdServ?: string
  claveUnidad?: string
  sku: string
  descripcion: string
  cantidad: number
  precioUnitario: number
  descuento: number
  subtotal: number
  iva: number
  total: number
}

export interface SalesOrderActivity {
  id: string
  salesOrderId: string
  timestamp: Timestamp | string
  userId?: string
  userName?: string
  action: "created" | "updated" | "confirmed" | "cancelled" | "delivered" | "invoiced" | "email_sent" | "printed"
  description: string
  metadata?: Record<string, any>
}

export interface ProductBatch extends BaseDocument {
  productoId: string
  productoNombre: string
  sku: string
  lote: string
  serie?: string
  numeroLote: string

  // Stock by warehouse
  almacenes: {
    almacenId: string
    almacenNombre: string
    cantidad: number
    ubicacion?: string
  }[]

  // Dates
  fechaFabricacion?: Timestamp | string
  fechaCaducidad?: Timestamp | string
  fechaRecepcion: Timestamp | string

  // Origin
  proveedorId?: string
  proveedorNombre?: string
  paisOrigen?: string
  documentoOrigen?: string

  // Traceability
  certificaciones?: string[]
  trazabilidad?: {
    evento: string
    fecha: Timestamp | string
    usuario: string
    notas?: string
  }[]

  // Status
  estado: "disponible" | "reservado" | "vencido" | "cuarentena"
  estrategia: "FIFO" | "FEFO" | "LIFO"

  // Quality
  inspeccionado: boolean
  estadoInspeccion?: "aprobado" | "rechazado" | "pendiente"
  notasCalidad?: string

  // Documents
  documentosAdjuntos?: {
    nombre: string
    url: string
    tipo: string
  }[]
}

export interface ExchangeRate extends BaseDocument {
  fecha: Timestamp | string
  tasas: {
    USD: number // 1 USD = X MXN
    EUR: number // 1 EUR = X MXN
  }
  fuente?: string // e.g., "Banco de México", "Manual"
  activo: boolean
}

// Maintenance Module - ERP 2026-2027
// Equipment (Catálogo de Equipos)
export interface Equipment extends BaseDocument {
  // Identificación
  codigo: string // Código único del equipo
  nombre: string // Nombre descriptivo
  categoria: string // Tipo: "Maquinaria", "Vehículo", "Herramienta", "Infraestructura"
  subcategoria?: string

  // Ubicación
  planta: string // Planta donde se encuentra
  area: string // Área específica (producción, almacén, etc.)
  ubicacionDetalle?: string

  // Especificaciones técnicas
  marca?: string
  modelo?: string
  numeroSerie?: string
  añoFabricacion?: number

  // Gestión
  criticidad: "baja" | "media" | "alta" | "critica" // Importancia operativa
  responsableId?: string // Usuario responsable
  responsableNombre?: string
  estado: "operativo" | "mantenimiento" | "fuera_servicio" | "baja"

  // Lecturas (para mantenimiento preventivo basado en uso)
  tipoLectura?: "horas" | "kilometros" | "ciclos" | "ninguno"
  lecturaActual: number // Lectura actual
  unidadLectura: string // "hrs", "km", "ciclos"

  // Mantenimiento
  frecuenciaMantenimiento?: number // Cada cuánto (en unidad de lectura o días)
  proximoMantenimiento?: Timestamp | string
  ultimoMantenimiento?: Timestamp | string

  // Costos estimados
  costoAdquisicion?: number
  costoMantenimientoAnual?: number

  // Relación con almacén (para refacciones)
  almacenRefaccionesId?: string // Almacén donde se guardan las refacciones de este equipo
  almacenRefaccionesNombre?: string

  // Documentación
  manuales?: string[] // URLs a manuales
  certificados?: string[] // URLs a certificados

  notas?: string
}

// Preventive Maintenance (Mantenimientos Preventivos)
export interface PreventiveMaintenance extends BaseDocument {
  // Identificación
  codigo: string
  nombre: string
  descripcion?: string

  // Equipo relacionado
  equipoId: string
  equipoNombre: string
  equipoCodigo: string

  // Tipo de preventivo
  tipo: "calendario" | "lectura" // Por fechas o por uso

  // Periodicidad por calendario
  periodicidadDias?: number // Cada cuántos días
  proximaFechaEjecucion?: Timestamp | string

  // Periodicidad por lectura
  periodicidadLectura?: number // Cada cuántas unidades de lectura
  lecturaBaseUltimaEjecucion?: number
  proximaLectura?: number

  // Última ejecución
  ultimaEjecucion?: Timestamp | string
  ultimaOrdenTrabajoId?: string

  // Actividades (checklist)
  actividades: {
    descripcion: string
    orden: number
    tiempoEstimado?: number // minutos
    requiereEvidencia: boolean
  }[]

  // Refacciones requeridas
  refacciones?: {
    productoId: string
    sku: string
    nombre: string
    cantidad: number
    unidad: string
  }[]

  // Recursos
  tecnicoAsignadoId?: string
  tecnicoAsignadoNombre?: string
  tiempoEstimadoTotal: number // minutos

  // Generación automática
  generacionAutomatica: boolean // Si se generan OTs automáticamente
  diasAnticipacion: number // Días de anticipación para generar OT

  estado: "activo" | "inactivo" | "suspendido"

  notas?: string
}

// Work Order (Órdenes de Trabajo)
export interface WorkOrder extends BaseDocument {
  // Identificación
  folio: string
  tipo: "preventivo" | "correctivo" | "predictivo" | "mejora"

  // Equipo
  equipoId: string
  equipoNombre: string
  equipoCodigo: string
  equipoPlanta: string

  // Si proviene de un preventivo
  preventivo?: {
    preventivoId: string
    preventivoCodigo: string
    preventivoNombre: string
    generadoAutomaticamente: boolean
  }

  // Estado y prioridad
  estado: "draft" | "programada" | "en_proceso" | "completada" | "cancelada"
  prioridad: "baja" | "media" | "alta" | "urgente"

  // Fechas
  fechaCreacion: Timestamp | string
  fechaProgramada: Timestamp | string
  fechaInicio?: Timestamp | string
  fechaFinalizacion?: Timestamp | string

  // Asignación
  tecnicoAsignadoId?: string
  tecnicoAsignadoNombre?: string
  tecnicoEjecutorId?: string // Puede ser diferente al asignado
  tecnicoEjecutorNombre?: string

  // Descripción del trabajo
  descripcionProblema?: string // Para correctivos
  actividades: WorkOrderActivity[] // Checklist con evidencias

  // Refacciones utilizadas
  refacciones?: WorkOrderSparePart[]

  // Tiempos
  tiempoEstimado?: number // minutos
  tiempoReal?: number // minutos
  tiempoParoEquipo?: number // minutos de paro operacional

  // Costos
  costoManoObra: number
  costoRefacciones: number
  costoParo: number // Costo del tiempo de paro
  costoTotal: number

  // Resultados y evidencias
  observaciones?: string
  evidencias?: {
    tipo: "foto" | "documento" | "video"
    url: string
    descripcion?: string
    timestamp: Timestamp | string
  }[]

  // Aprobación y firma
  requiereAprobacion: boolean
  aprobadoPor?: string
  fechaAprobacion?: Timestamp | string

  // Lectura del equipo al momento del mantenimiento
  lecturaEquipo?: number

  notas?: string
}

export interface WorkOrderActivity {
  descripcion: string
  orden: number
  completada: boolean
  evidenciaRequerida: boolean
  evidenciaUrl?: string
  observaciones?: string
  completadaPor?: string
  fechaCompletada?: Timestamp | string
}

export interface WorkOrderSparePart {
  productoId: string
  sku: string
  nombre: string
  cantidad: number
  unidad: string
  costoUnitario: number
  costoTotal: number
  almacenId?: string // De qué almacén se tomó
  almacenNombre?: string
  movimientoId?: string // ID del movimiento de inventario generado
  lote?: string
  serie?: string
}

// Equipment Reading (Lecturas de Equipos)
export interface EquipmentReading extends BaseDocument {
  // Equipo
  equipoId: string
  equipoNombre: string
  equipoCodigo: string

  // Lectura
  fecha: Timestamp | string
  lectura: number
  unidad: string // "hrs", "km", "ciclos"

  // Registro
  registradoPor: string
  registradoPorNombre: string

  // Observaciones
  estadoEquipo?: "operativo" | "alerta" | "falla"
  observaciones?: string

  // Imagen de evidencia (opcional)
  evidenciaUrl?: string
}

// Maintenance Technician (Técnicos de Mantenimiento)
export interface MaintenanceTechnician extends BaseDocument {
  // Datos personales
  nombre: string
  email?: string
  telefono?: string

  // Especialidades
  especialidades: string[] // "Mecánica", "Eléctrica", "Electrónica", "Neumática", etc.
  certificaciones?: string[]

  // Asignación
  plantas: string[] // En qué plantas puede trabajar
  disponible: boolean

  // Estadísticas
  otsCompletadas: number
  otsEnProceso: number
  promedioTiempoRespuesta?: number // minutos

  estado: "activo" | "inactivo" | "vacaciones"

  notas?: string
}
