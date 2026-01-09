'use client'

import { useState } from 'react'

export default function FileUpload({ onDataLoaded }: any) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',')

      const rows = lines.slice(1).map((line) => {
        const values = line.split(',')
        return {
          month: values[0],
          sales: Number(values[1]),
        }
      })

      onDataLoaded(rows)
    }

    reader.readAsText(file)
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow mb-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-2">
        Cargar archivo de ventas
      </h3>

      <label className="inline-block cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
        Seleccionar archivo CSV
    <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="hidden"
        />
      </label>
    </div>
  )
}
