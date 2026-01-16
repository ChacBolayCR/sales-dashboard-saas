"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import FileUpload from "@/components/FileUpload"

type ChartItem = {
  date: string
  sales: number
}

export default function Home() {
  const [chartData, setChartData] = useState<ChartItem[]>([])

  /* =====================
     CÁLCULOS KPI
  ===================== */

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const currentMonthSales = chartData
    .filter(item => {
      const d = new Date(item.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((sum, item) => sum + (item.sales || 0), 0)

  const previousMonthSales = chartData
    .filter(item => {
      const d = new Date(item.date)
      return (
        d.getMonth() === currentMonth - 1 &&
        d.getFullYear() === currentYear
      )
    })
    .reduce((sum, item) => sum + (item.sales || 0), 0)

  const totalSales = chartData.reduce(
    (sum, item) => sum + (item.sales || 0),
    0
  )

  const growth =
    previousMonthSales > 0
      ? ((currentMonthSales - previousMonthSales) /
          previousMonthSales) *
        100
      : 0

  /* =====================
     UI
  ===================== */

  return (
    <main className="min-h-screen bg-gray-500 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-white">
          <h1 className="text-3xl font-bold">
            Sales Analytics Dashboard
          </h1>
          <p className="text-gray-200">
            Demo — sube tu archivo y visualiza tus ventas
          </p>
        </header>

        {/* Upload */}
        <div className="bg-white rounded-2xl shadow p-4">
          <FileUpload onDataLoaded={setChartData} />
        </div>

        {/* KPI CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard
            title="Ventas del mes"
            value={currentMonthSales}
          />
          <KpiCard
            title="Mes anterior"
            value={previousMonthSales}
          />
          <KpiCard
            title="Ventas totales"
            value={totalSales}
          />
          <KpiCard
            title="Crecimiento"
            value={`${growth.toFixed(1)}%`}
            highlight
          />
        </section>

        {/* GRÁFICO */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Evolución de ventas
          </h2>

          {chartData.length === 0 ? (
            <p className="text-gray-500">
              Sube un archivo para ver el gráfico
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Watermark */}
        <footer className="text-center text-gray-300 text-sm">
          Demo MVP — Datos simulados
        </footer>
      </div>
    </main>
  )
}

/* =====================
   COMPONENTES
===================== */

function KpiCard({
  title,
  value,
  highlight = false,
}: {
  title: string
  value: number | string
  highlight?: boolean
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p
        className={`text-2xl font-bold mt-1 ${
          highlight ? "text-blue-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  )
}
