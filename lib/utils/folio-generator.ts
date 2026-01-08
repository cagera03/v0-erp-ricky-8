/**
 * Utility to generate sequential folio numbers
 */

export function generateFolio(prefix: string, lastNumber: number): string {
  const nextNumber = lastNumber + 1
  const paddedNumber = nextNumber.toString().padStart(6, "0")
  return `${prefix}-${paddedNumber}`
}

export function parseFolioNumber(folio: string): number {
  const parts = folio.split("-")
  if (parts.length === 2) {
    return Number.parseInt(parts[1], 10) || 0
  }
  return 0
}

export function getNextFolio(existingFolios: string[], prefix: string): string {
  if (existingFolios.length === 0) {
    return generateFolio(prefix, 0)
  }

  const numbers = existingFolios
    .filter((f) => f.startsWith(prefix))
    .map(parseFolioNumber)
    .filter((n) => !isNaN(n))

  const maxNumber = Math.max(0, ...numbers)
  return generateFolio(prefix, maxNumber)
}
