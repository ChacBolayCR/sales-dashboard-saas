"use client"

import { useState } from "react"
import Papa from "papaparse"

export type ChartItem = {
  date: string
  sales: number
  product: string
}

type FileUploadProps = {
  onDataLoaded: (data: ChartItem[]) => void
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setLoading(true)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        try {
          const rows = results.data || []

          if (rows.length === 0) {
            setError("El archivo no contiene datos válidos.")
            return
          }

          const headers = Object.keys(rows[0]).map(h => h.toLowerCase())

          const dateKey = headers.find(h =>
            ["date", "fecha"].includes(h)
          )
          const salesKey = headers.find(h =>
            ["sales", "ventas", "total"].includes(h)
          )
          const productKey = headers.find(h =>
            ["product", "producto"].includes(h)
          )

          if (!dateKey || !salesKey) {
            setError("El archivo debe incluir fecha y ventas.")
            return
          }

          const normalized = rows
            .map(row => {
              const date = row[dateKey]
              const sales = Number(row[salesKey])
              const product = productKey
                ? row[productKey] || "General"
                : "General"

              if (!date || isNaN(sales)) return null

              return {
                date,
                sales,
                product,
              }
            })
            .filter(Boolean) as ChartItem[]

          if (normalized.length === 0) {
            setError("No se encontraron filas válidas.")
            return
          }

          onDataLoaded(normalized)
        } catch {
          setError("Error procesando el archivo.")
        } finally {
          setLoading(false)
        }
      },
      error: () => {
        setError("No se pudo leer el archivo.")
        setLoading(false)
      },
    })
  }

  return (
    <div className="border-2 border-dashed border-gray-600 rounded-xl p-4">
      <label className="block text-sm font-medium text-gray-800 mb-2">
        Selecciona tu archivo CSV
      </label>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block w-full text-sm"
      />

      {loading && (
        <p className="text-sm text-gray-800 mt-2">
          ⏳ Procesando archivo…
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-2">
          ❌ {error}
        </p>
      )}

      <p className="text-xs text-gray-800 mt-3">
        Columnas: date, sales, product (product es opcional)
      </p>
    </div>
  )
}
