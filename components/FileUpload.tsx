"use client"

import { useState } from "react"
import Papa from "papaparse"

type ChartItem = {
  date: string
  sales: number
  product?: string
}

export default function FileUpload({
  onDataLoaded,
}: {
  onDataLoaded: (data: ChartItem[]) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = (file: File) => {
    setError(null)
    setLoading(true)

    // ✅ Validación flexible (mobile friendly)
    const isProbablyText =
      file.type.includes("csv") ||
      file.type.includes("text") ||
      file.name.toLowerCase().endsWith(".csv")

    if (!isProbablyText) {
      setError("El archivo debe ser un CSV válido")
      setLoading(false)
      return
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        try {
          const parsed: ChartItem[] = (results.data as any[])
            .filter(row => row.date && row.sales)
            .map(row => ({
              date: String(row.date),
              sales: Number(row.sales),
              product: row.product ? String(row.product) : undefined,
            }))

          if (parsed.length === 0) {
            throw new Error("El archivo no contiene datos válidos")
          }

          onDataLoaded(parsed)
        } catch (e) {
          setError(
            "No se pudieron leer los datos. Verifica que el CSV tenga columnas: date, sales, product (opcional)."
          )
        } finally {
          setLoading(false)
        }
      },
      error: () => {
        setError("Error al leer el archivo CSV")
        setLoading(false)
      },
    })
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="block text-sm font-semibold text-gray-800 mb-1">
          Subir archivo de ventas (CSV)
        </span>

        <input
          type="file"
          accept=".csv,text/csv,text/plain"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.currentTarget.value = ""
          }}
          className="
            block w-full text-sm text-gray-800
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-600 file:text-white
            hover:file:bg-blue-700
          "
        />
      </label>

      {/* UX hint mobile */}
      <p className="text-xs text-gray-600">
        📱 <strong>Desde celular:</strong> si el archivo no aparece, guárdalo primero
        en <em>Archivos</em> o <em>Descargas</em> e inténtalo de nuevo.
      </p>

      {loading && (
        <p className="text-sm text-blue-700 font-medium">
          Procesando archivo…
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  )
}
