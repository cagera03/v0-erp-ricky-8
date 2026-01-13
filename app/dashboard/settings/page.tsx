"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { getFirebaseDb } from "@/lib/firebase"

type EmpresaItem = {
  id: string
  name: string
  rfc: string
}

type SucursalItem = {
  id: string
  name: string
  address: string
  phone: string
}

type SerieFolioItem = {
  id: string
  name: string
  serie: string
  folioStart: string
  folioActual: string
  tipo: string
}

type CertificadoItem = {
  id: string
  nombre: string
  numeroSerie: string
  vigenciaInicio: string
  vigenciaFin: string
  archivoCer: string
  archivoKey: string
}

type MonedaItem = {
  id: string
  code: string
  name: string
  tipoCambio: string
  base: boolean
}

type ImpuestoItem = {
  id: string
  nombre: string
  tipo: string
  tasa: string
}

type CatalogItem = {
  id: string
  code: string
  name: string
}

type CoreConfig = {
  empresa: {
    nombre: string
    rfc: string
    regimenFiscal: string
    usoCfdi: string
    domicilioFiscal: string
    email: string
    phone: string
    website: string
  }
  branding: {
    logoUrl: string
    pdfHeader: string
    pdfFooter: string
  }
  empresas: EmpresaItem[]
  sucursales: SucursalItem[]
  seriesFolios: SerieFolioItem[]
  certificadosCsd: CertificadoItem[]
  pacTimbrado: {
    proveedor: string
    usuario: string
    password: string
    entorno: string
  }
  monedas: MonedaItem[]
  impuestos: ImpuestoItem[]
  metodosPago: CatalogItem[]
  formasPago: CatalogItem[]
}

export default function SettingsPage() {
  const { user, companyId } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  const makeId = () => Math.random().toString(36).slice(2, 10)

  const [coreConfig, setCoreConfig] = useState<CoreConfig>({
    empresa: {
      nombre: "",
      rfc: "",
      regimenFiscal: "",
      usoCfdi: "",
      domicilioFiscal: "",
      email: "",
      phone: "",
      website: "",
    },
    branding: {
      logoUrl: "",
      pdfHeader: "",
      pdfFooter: "",
    },
    empresas: [],
    sucursales: [],
    seriesFolios: [],
    certificadosCsd: [],
    pacTimbrado: {
      proveedor: "",
      usuario: "",
      password: "",
      entorno: "produccion",
    },
    monedas: [
      {
        id: makeId(),
        code: "MXN",
        name: "Peso Mexicano",
        tipoCambio: "1.0",
        base: true,
      },
    ],
    impuestos: [
      {
        id: makeId(),
        nombre: "IVA",
        tipo: "traslado",
        tasa: "16",
      },
    ],
    metodosPago: [],
    formasPago: [],
  })

  const displayName = user?.name || user?.displayName || ""
  const email = user?.email || ""

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadConfig = async () => {
      if (!companyId) return
      const db = getFirebaseDb()
      const docRef = doc(db, "companies", companyId)
      const snapshot = await getDoc(docRef)
      if (snapshot.exists()) {
        const data = snapshot.data() as { coreConfig?: CoreConfig }
        if (data.coreConfig) {
          setCoreConfig(data.coreConfig)
        }
      }
    }

    loadConfig().catch((error) => {
      console.error("[Settings] Error loading company config:", error)
    })
  }, [companyId])

  const handleSaveCore = async () => {
    if (!companyId || !user) return
    setIsSaving(true)
    setSaveMessage("")
    const db = getFirebaseDb()
    const docRef = doc(db, "companies", companyId)

    try {
      const snapshot = await getDoc(docRef)
      const payload = {
        coreConfig,
        userId: user.uid,
        updatedAt: serverTimestamp(),
      }

      if (snapshot.exists()) {
        await updateDoc(docRef, payload)
      } else {
        await setDoc(docRef, {
          ...payload,
          createdAt: serverTimestamp(),
        })
      }

      setSaveMessage("Configuracion guardada.")
    } catch (error) {
      console.error("[Settings] Error saving core config:", error)
      setSaveMessage("No se pudo guardar la configuracion.")
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = () => {
    const name = displayName || email || "U"
    const parts = name.split(" ").filter(Boolean)
    if (parts.length === 0) return "U"
    return parts
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{displayName || "Usuario"}</p>
                <p className="text-xs text-muted-foreground">{email || "Sin correo"}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="settings-name">Nombre completo</Label>
                <Input id="settings-name" defaultValue={displayName} placeholder="Nombre y apellido" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-phone">Telefono</Label>
                <Input id="settings-phone" placeholder="+52 81 0000 0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-role">Rol</Label>
                <Input id="settings-role" defaultValue={user?.role || ""} placeholder="Administrador" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-area">Area</Label>
                <Input id="settings-area" placeholder="Ventas, Compras, Operaciones" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button">Guardar cambios</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Cuenta</p>
              <p className="text-xs text-muted-foreground">ID: {user?.uid || "Sin sesion"}</p>
            </div>
            <Button type="button" variant="outline">
              Cambiar contrasena
            </Button>
            <Button type="button" variant="outline">
              Cerrar sesiones activas
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Tema</p>
                <p className="text-xs text-muted-foreground">Elige claro, oscuro o automático</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={mounted && theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                >
                  Claro
                </Button>
                <Button
                  type="button"
                  variant={mounted && theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                >
                  Oscuro
                </Button>
                <Button
                  type="button"
                  variant={mounted && theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                >
                  Auto
                </Button>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Modo oscuro rápido</p>
                <p className="text-xs text-muted-foreground">Alterna entre claro y oscuro</p>
              </div>
              <Switch
                checked={mounted ? theme === "dark" : false}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Ventas</p>
                <p className="text-xs text-muted-foreground">Alertas de nuevas ordenes y pagos</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Inventario</p>
                <p className="text-xs text-muted-foreground">Stock bajo y recepciones</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Calendario</p>
                <p className="text-xs text-muted-foreground">Recordatorios de citas</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Reportes</p>
                <p className="text-xs text-muted-foreground">Resumen semanal por correo</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Configuracion / Empresa (Core)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="core-company-name">Nombre de empresa</Label>
                <Input
                  id="core-company-name"
                  value={coreConfig.empresa.nombre}
                  onChange={(event) =>
                    setCoreConfig((prev) => ({
                      ...prev,
                      empresa: { ...prev.empresa, nombre: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="core-company-rfc">RFC</Label>
                <Input
                  id="core-company-rfc"
                  value={coreConfig.empresa.rfc}
                  onChange={(event) =>
                    setCoreConfig((prev) => ({
                      ...prev,
                      empresa: { ...prev.empresa, rfc: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="core-company-regimen">Regimen fiscal</Label>
                <Input
                  id="core-company-regimen"
                  value={coreConfig.empresa.regimenFiscal}
                  onChange={(event) =>
                    setCoreConfig((prev) => ({
                      ...prev,
                      empresa: { ...prev.empresa, regimenFiscal: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="core-company-uso">Uso CFDI</Label>
                <Input
                  id="core-company-uso"
                  value={coreConfig.empresa.usoCfdi}
                  onChange={(event) =>
                    setCoreConfig((prev) => ({
                      ...prev,
                      empresa: { ...prev.empresa, usoCfdi: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="core-company-email">Correo fiscal</Label>
                <Input
                  id="core-company-email"
                  value={coreConfig.empresa.email}
                  onChange={(event) =>
                    setCoreConfig((prev) => ({
                      ...prev,
                      empresa: { ...prev.empresa, email: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="core-company-phone">Telefono</Label>
                <Input
                  id="core-company-phone"
                  value={coreConfig.empresa.phone}
                  onChange={(event) =>
                    setCoreConfig((prev) => ({
                      ...prev,
                      empresa: { ...prev.empresa, phone: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="core-company-website">Sitio web</Label>
                <Input
                  id="core-company-website"
                  value={coreConfig.empresa.website}
                  onChange={(event) =>
                    setCoreConfig((prev) => ({
                      ...prev,
                      empresa: { ...prev.empresa, website: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="core-company-address">Domicilio fiscal</Label>
                <Textarea
                  id="core-company-address"
                  value={coreConfig.empresa.domicilioFiscal}
                  onChange={(event) =>
                    setCoreConfig((prev) => ({
                      ...prev,
                      empresa: { ...prev.empresa, domicilioFiscal: event.target.value },
                    }))
                  }
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="core-branding-logo">Branding - Logo (URL)</Label>
                <Input
                  id="core-branding-logo"
                  value={coreConfig.branding.logoUrl}
                  onChange={(event) =>
                    setCoreConfig((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, logoUrl: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="core-branding-header">Branding - Encabezado PDF</Label>
                <Input
                  id="core-branding-header"
                  value={coreConfig.branding.pdfHeader}
                  onChange={(event) =>
                    setCoreConfig((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, pdfHeader: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="core-branding-footer">Branding - Pie de pagina PDF</Label>
                <Textarea
                  id="core-branding-footer"
                  value={coreConfig.branding.pdfFooter}
                  onChange={(event) =>
                    setCoreConfig((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, pdfFooter: event.target.value },
                    }))
                  }
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empresas (multi-empresa)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coreConfig.empresas.length === 0 && (
              <p className="text-sm text-muted-foreground">Agrega empresas relacionadas si manejas multi-empresa.</p>
            )}
            <div className="space-y-4">
              {coreConfig.empresas.map((empresa, index) => (
                <div key={empresa.id} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <Input
                    placeholder="Nombre"
                    value={empresa.name}
                    onChange={(event) => {
                      const empresas = [...coreConfig.empresas]
                      empresas[index] = { ...empresa, name: event.target.value }
                      setCoreConfig((prev) => ({ ...prev, empresas }))
                    }}
                  />
                  <Input
                    placeholder="RFC"
                    value={empresa.rfc}
                    onChange={(event) => {
                      const empresas = [...coreConfig.empresas]
                      empresas[index] = { ...empresa, rfc: event.target.value }
                      setCoreConfig((prev) => ({ ...prev, empresas }))
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const empresas = coreConfig.empresas.filter((item) => item.id !== empresa.id)
                      setCoreConfig((prev) => ({ ...prev, empresas }))
                    }}
                  >
                    Quitar
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setCoreConfig((prev) => ({
                  ...prev,
                  empresas: [...prev.empresas, { id: makeId(), name: "", rfc: "" }],
                }))
              }
            >
              Agregar empresa
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sucursales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coreConfig.sucursales.map((sucursal, index) => (
              <div key={sucursal.id} className="grid gap-3 lg:grid-cols-4">
                <Input
                  placeholder="Nombre"
                  value={sucursal.name}
                  onChange={(event) => {
                    const sucursales = [...coreConfig.sucursales]
                    sucursales[index] = { ...sucursal, name: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, sucursales }))
                  }}
                />
                <Input
                  placeholder="Direccion"
                  value={sucursal.address}
                  onChange={(event) => {
                    const sucursales = [...coreConfig.sucursales]
                    sucursales[index] = { ...sucursal, address: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, sucursales }))
                  }}
                />
                <Input
                  placeholder="Telefono"
                  value={sucursal.phone}
                  onChange={(event) => {
                    const sucursales = [...coreConfig.sucursales]
                    sucursales[index] = { ...sucursal, phone: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, sucursales }))
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const sucursales = coreConfig.sucursales.filter((item) => item.id !== sucursal.id)
                    setCoreConfig((prev) => ({ ...prev, sucursales }))
                  }}
                >
                  Quitar
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setCoreConfig((prev) => ({
                  ...prev,
                  sucursales: [...prev.sucursales, { id: makeId(), name: "", address: "", phone: "" }],
                }))
              }
            >
              Agregar sucursal
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Series y folios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coreConfig.seriesFolios.map((serie, index) => (
              <div key={serie.id} className="grid gap-3 lg:grid-cols-5">
                <Input
                  placeholder="Nombre"
                  value={serie.name}
                  onChange={(event) => {
                    const seriesFolios = [...coreConfig.seriesFolios]
                    seriesFolios[index] = { ...serie, name: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, seriesFolios }))
                  }}
                />
                <Input
                  placeholder="Serie"
                  value={serie.serie}
                  onChange={(event) => {
                    const seriesFolios = [...coreConfig.seriesFolios]
                    seriesFolios[index] = { ...serie, serie: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, seriesFolios }))
                  }}
                />
                <Input
                  placeholder="Folio inicial"
                  value={serie.folioStart}
                  onChange={(event) => {
                    const seriesFolios = [...coreConfig.seriesFolios]
                    seriesFolios[index] = { ...serie, folioStart: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, seriesFolios }))
                  }}
                />
                <Input
                  placeholder="Folio actual"
                  value={serie.folioActual}
                  onChange={(event) => {
                    const seriesFolios = [...coreConfig.seriesFolios]
                    seriesFolios[index] = { ...serie, folioActual: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, seriesFolios }))
                  }}
                />
                <Input
                  placeholder="Tipo"
                  value={serie.tipo}
                  onChange={(event) => {
                    const seriesFolios = [...coreConfig.seriesFolios]
                    seriesFolios[index] = { ...serie, tipo: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, seriesFolios }))
                  }}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setCoreConfig((prev) => ({
                  ...prev,
                  seriesFolios: [
                    ...prev.seriesFolios,
                    { id: makeId(), name: "", serie: "", folioStart: "", folioActual: "", tipo: "" },
                  ],
                }))
              }
            >
              Agregar serie
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificados CSD</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coreConfig.certificadosCsd.map((cert, index) => (
              <div key={cert.id} className="grid gap-3 lg:grid-cols-6">
                <Input
                  placeholder="Nombre"
                  value={cert.nombre}
                  onChange={(event) => {
                    const certificadosCsd = [...coreConfig.certificadosCsd]
                    certificadosCsd[index] = { ...cert, nombre: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, certificadosCsd }))
                  }}
                />
                <Input
                  placeholder="Numero serie"
                  value={cert.numeroSerie}
                  onChange={(event) => {
                    const certificadosCsd = [...coreConfig.certificadosCsd]
                    certificadosCsd[index] = { ...cert, numeroSerie: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, certificadosCsd }))
                  }}
                />
                <Input
                  placeholder="Vigencia inicio"
                  value={cert.vigenciaInicio}
                  onChange={(event) => {
                    const certificadosCsd = [...coreConfig.certificadosCsd]
                    certificadosCsd[index] = { ...cert, vigenciaInicio: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, certificadosCsd }))
                  }}
                />
                <Input
                  placeholder="Vigencia fin"
                  value={cert.vigenciaFin}
                  onChange={(event) => {
                    const certificadosCsd = [...coreConfig.certificadosCsd]
                    certificadosCsd[index] = { ...cert, vigenciaFin: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, certificadosCsd }))
                  }}
                />
                <Input
                  placeholder="Archivo .cer"
                  value={cert.archivoCer}
                  onChange={(event) => {
                    const certificadosCsd = [...coreConfig.certificadosCsd]
                    certificadosCsd[index] = { ...cert, archivoCer: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, certificadosCsd }))
                  }}
                />
                <Input
                  placeholder="Archivo .key"
                  value={cert.archivoKey}
                  onChange={(event) => {
                    const certificadosCsd = [...coreConfig.certificadosCsd]
                    certificadosCsd[index] = { ...cert, archivoKey: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, certificadosCsd }))
                  }}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setCoreConfig((prev) => ({
                  ...prev,
                  certificadosCsd: [
                    ...prev.certificadosCsd,
                    {
                      id: makeId(),
                      nombre: "",
                      numeroSerie: "",
                      vigenciaInicio: "",
                      vigenciaFin: "",
                      archivoCer: "",
                      archivoKey: "",
                    },
                  ],
                }))
              }
            >
              Agregar certificado
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PAC de timbrado</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Input
                value={coreConfig.pacTimbrado.proveedor}
                onChange={(event) =>
                  setCoreConfig((prev) => ({
                    ...prev,
                    pacTimbrado: { ...prev.pacTimbrado, proveedor: event.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input
                value={coreConfig.pacTimbrado.usuario}
                onChange={(event) =>
                  setCoreConfig((prev) => ({
                    ...prev,
                    pacTimbrado: { ...prev.pacTimbrado, usuario: event.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={coreConfig.pacTimbrado.password}
                onChange={(event) =>
                  setCoreConfig((prev) => ({
                    ...prev,
                    pacTimbrado: { ...prev.pacTimbrado, password: event.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Entorno</Label>
              <Input
                value={coreConfig.pacTimbrado.entorno}
                onChange={(event) =>
                  setCoreConfig((prev) => ({
                    ...prev,
                    pacTimbrado: { ...prev.pacTimbrado, entorno: event.target.value },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monedas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coreConfig.monedas.map((moneda, index) => (
              <div key={moneda.id} className="grid gap-3 lg:grid-cols-4">
                <Input
                  placeholder="Codigo"
                  value={moneda.code}
                  onChange={(event) => {
                    const monedas = [...coreConfig.monedas]
                    monedas[index] = { ...moneda, code: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, monedas }))
                  }}
                />
                <Input
                  placeholder="Nombre"
                  value={moneda.name}
                  onChange={(event) => {
                    const monedas = [...coreConfig.monedas]
                    monedas[index] = { ...moneda, name: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, monedas }))
                  }}
                />
                <Input
                  placeholder="Tipo cambio"
                  value={moneda.tipoCambio}
                  onChange={(event) => {
                    const monedas = [...coreConfig.monedas]
                    monedas[index] = { ...moneda, tipoCambio: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, monedas }))
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const monedas = coreConfig.monedas.filter((item) => item.id !== moneda.id)
                    setCoreConfig((prev) => ({ ...prev, monedas }))
                  }}
                >
                  Quitar
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setCoreConfig((prev) => ({
                  ...prev,
                  monedas: [...prev.monedas, { id: makeId(), code: "", name: "", tipoCambio: "", base: false }],
                }))
              }
            >
              Agregar moneda
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impuestos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coreConfig.impuestos.map((tax, index) => (
              <div key={tax.id} className="grid gap-3 lg:grid-cols-4">
                <Input
                  placeholder="Nombre"
                  value={tax.nombre}
                  onChange={(event) => {
                    const impuestos = [...coreConfig.impuestos]
                    impuestos[index] = { ...tax, nombre: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, impuestos }))
                  }}
                />
                <Input
                  placeholder="Tipo (IVA, retencion)"
                  value={tax.tipo}
                  onChange={(event) => {
                    const impuestos = [...coreConfig.impuestos]
                    impuestos[index] = { ...tax, tipo: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, impuestos }))
                  }}
                />
                <Input
                  placeholder="Tasa %"
                  value={tax.tasa}
                  onChange={(event) => {
                    const impuestos = [...coreConfig.impuestos]
                    impuestos[index] = { ...tax, tasa: event.target.value }
                    setCoreConfig((prev) => ({ ...prev, impuestos }))
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const impuestos = coreConfig.impuestos.filter((item) => item.id !== tax.id)
                    setCoreConfig((prev) => ({ ...prev, impuestos }))
                  }}
                >
                  Quitar
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setCoreConfig((prev) => ({
                  ...prev,
                  impuestos: [...prev.impuestos, { id: makeId(), nombre: "", tipo: "", tasa: "" }],
                }))
              }
            >
              Agregar impuesto
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metodos y formas de pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Metodos de pago</h4>
              {coreConfig.metodosPago.map((method, index) => (
                <div key={method.id} className="grid gap-3 lg:grid-cols-3">
                  <Input
                    placeholder="Codigo"
                    value={method.code}
                    onChange={(event) => {
                      const metodosPago = [...coreConfig.metodosPago]
                      metodosPago[index] = { ...method, code: event.target.value }
                      setCoreConfig((prev) => ({ ...prev, metodosPago }))
                    }}
                  />
                  <Input
                    placeholder="Nombre"
                    value={method.name}
                    onChange={(event) => {
                      const metodosPago = [...coreConfig.metodosPago]
                      metodosPago[index] = { ...method, name: event.target.value }
                      setCoreConfig((prev) => ({ ...prev, metodosPago }))
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const metodosPago = coreConfig.metodosPago.filter((item) => item.id !== method.id)
                      setCoreConfig((prev) => ({ ...prev, metodosPago }))
                    }}
                  >
                    Quitar
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setCoreConfig((prev) => ({
                    ...prev,
                    metodosPago: [...prev.metodosPago, { id: makeId(), code: "", name: "" }],
                  }))
                }
              >
                Agregar metodo
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Formas de pago</h4>
              {coreConfig.formasPago.map((forma, index) => (
                <div key={forma.id} className="grid gap-3 lg:grid-cols-3">
                  <Input
                    placeholder="Codigo"
                    value={forma.code}
                    onChange={(event) => {
                      const formasPago = [...coreConfig.formasPago]
                      formasPago[index] = { ...forma, code: event.target.value }
                      setCoreConfig((prev) => ({ ...prev, formasPago }))
                    }}
                  />
                  <Input
                    placeholder="Nombre"
                    value={forma.name}
                    onChange={(event) => {
                      const formasPago = [...coreConfig.formasPago]
                      formasPago[index] = { ...forma, name: event.target.value }
                      setCoreConfig((prev) => ({ ...prev, formasPago }))
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const formasPago = coreConfig.formasPago.filter((item) => item.id !== forma.id)
                      setCoreConfig((prev) => ({ ...prev, formasPago }))
                    }}
                  >
                    Quitar
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setCoreConfig((prev) => ({
                    ...prev,
                    formasPago: [...prev.formasPago, { id: makeId(), code: "", name: "" }],
                  }))
                }
              >
                Agregar forma
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">{saveMessage}</div>
          <Button type="button" onClick={handleSaveCore} disabled={isSaving || !companyId}>
            {isSaving ? "Guardando..." : "Guardar configuracion"}
          </Button>
        </div>
      </div>
    </div>
  )
}

