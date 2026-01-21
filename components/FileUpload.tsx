"use client"

import { useState } from "react"
import Papa from "papaparse"

type ChartItem = {
  date: string
  sales: number
}

type FileUploadProps = {
  onDataLoaded: (data: ChartItem[]) => void
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState<{
    days: number
    from: string
    to: string
    total: number
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setLoading(true)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        try {
          const rows = Array.isArray(results.data)
            ? results.data
            : []

          if (rows.length === 0) {
            setError("El archivo está vacío o no contiene datos válidos.")
            setLoading(false)
            return
          }

          // Detectar columnas flexibles
          const headers = Object.keys(rows[0]).map(h =>
            h.toLowerCase().trim()
          )

          const dateKey = headers.find(h =>
            ["date", "fecha", "day"].includes(h)
          )

          const salesKey = headers.find(h =>
            ["sales", "ventas", "total", "amount"].includes(h)
          )

          if (!dateKey || !salesKey) {
            setError(
              "No se encontraron columnas válidas. Incluye una columna de fecha y una de ventas."
            )
            setLoading(false)
            return
          }

          // Normalizar datos
          const normalizedData: ChartItem[] = rows
            .map(row => {
              const date = row[dateKey]
              const sales = Number(row[salesKey])

              if (!date || isNaN(sales)) return null

              return { date, sales }
            })
            .filter((row): row is ChartItem => row !== null)

          if (normalizedData.length === 0) {
            setError("No se encontraron filas válidas para analizar.")
            setLoading(false)
            return
          }

          // Resumen para modal
          const totalSales = normalizedData.reduce(
            (acc, item) => acc + item.sales,
            0
          )

          setSummary({
            days: normalizedData.length,
            from: normalizedData[0].date,
            to: normalizedData[normalizedData.length - 1].date,
            total: totalSales,
          })

          setShowSummary(true)
          onDataLoaded(normalizedData)

        } catch (err) {
          setError("Ocurrió un error al procesar el archivo.")
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
  const formatDate = (date: string) =>
  new Date(date + "T00:00:00").toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return (
    <>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecciona tu archivo CSV
        </label>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-600 file:text-white
            hover:file:bg-blue-700
            cursor-pointer"
        />

        {loading && (
          <p className="text-sm text-gray-500 mt-2">
            ⏳ Procesando archivo…
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 mt-2">
            ❌ {error}
          </p>
        )}

        <p className="text-xs text-gray-500 mt-3">
          Formato: CSV · Columnas comunes: fecha/date · ventas/sales
        </p>
      </div>

      {/* MODAL */}
      {showSummary && summary && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg text-gray-500 font-semibold mb-2">
              📊 Archivo cargado correctamente
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Analizamos tu archivo y encontramos lo siguiente:
            </p>  
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✔️ <strong>{summary.days}</strong> días detectados</li>
              <li>
                ✔️ Período:{" "}
                <strong>{formatDate(summary.from)}</strong> →{" "}
                <strong>{formatDate(summary.to)}</strong>
              </li>
              <li>
                ✔️ Ventas totales:{" "}
                <strong>
                  ${summary.total.toLocaleString("en-US")}
                </strong>
              </li>
            </ul>

            <button
              onClick={() => setShowSummary(false)}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Ver gráficos
            </button>
          </div>
        </div>
      )}
    </>
  )
}
