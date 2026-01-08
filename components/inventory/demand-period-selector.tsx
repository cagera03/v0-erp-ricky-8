"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface DemandPeriodSelectorProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

const PERIOD_OPTIONS = [
  { value: 15, label: "15 días" },
  { value: 30, label: "30 días" },
  { value: 90, label: "90 días (3 meses)" },
]

export function DemandPeriodSelector({ value, onChange, disabled }: DemandPeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="demand-period" className="text-sm font-medium whitespace-nowrap">
        Periodo:
      </Label>
      <Select value={value.toString()} onValueChange={(val) => onChange(Number(val))} disabled={disabled}>
        <SelectTrigger id="demand-period" className="w-[160px]">
          <SelectValue placeholder="Seleccionar periodo" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
