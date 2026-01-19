"use client"

import { useState } from "react"
import Papa from "papaparse"

type FileUploadProps = {
  onDataLoaded: (data: any[]) => void
}

const [error, setError] = useState<string | null>(null)
const [success, setSuccess] = useState<string | null>(null)

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(false)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setError("El archivo no contiene datos válidos")
          return
        }

        // 🔑 AQUÍ conectamos FileUpload con el dashboard
        onDataLoaded(results.data as any[])
        setSuccess(true)
      },
      error: () => {
        setError("Error al leer el archivo")
      },
    })
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 transition">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="
          block w-full text-sm text-gray-700
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-600 file:text-white
          hover:file:bg-blue-700
          cursor-pointer
          "
      />
      <p className="text-xs text-gray-500 mt-2">
        El archivo no se guarda. Solo se usa para esta demo.
      </p>

      {success && !error && (
        <p className="text-xs text-green-400 mt-2">
          Datos cargados correctamente. Analizando ventas…
        </p>
      )}
<p className="text-sm text-gray-600 mt-3">
  ¿No tienes un archivo?{" "}
  <a
    href="/sales_demo.csv"
    download
    className="text-blue-600 font-medium hover:underline"
  >
    Descarga un archivo de ejemplo
  </a>
</p>
<p className="text-xs text-gray-400 mt-1">
  El archivo es solo un ejemplo. Puedes adaptarlo a tus propios datos.
</p>

      {error && (
        <p className="text-red-600 text-sm mt-2">
          {error}
        </p>
      )}
    </div>
  )
}
