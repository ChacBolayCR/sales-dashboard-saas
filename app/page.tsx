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

/* =====================
   TYPES
===================== */

type ChartItem = {
  date: string
  sales: number
}

/* =====================
   PAGE
===================== */

export default function Home() {
  const [chartData, setChartData] = useState<ChartItem[]>([])

  /* =====================
     DATE RANGES (FIX)
  ===================== */

  const today = new Date()

  const startOfCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  )

  const startOfPreviousMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  )

  const endOfPreviousMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    0
  )

  /* =====================
     KPI CALCULATIONS
  ===================== */

  const currentMonthSales = chartData
    .filter(item => {
      const d = new Date(item.date + "T00:00:00")
      return d >= startOfCurrentMonth
    })
    .reduce((sum, item) => sum + item.sales, 0)

  const previousMonthSales = chartData
    .filter(item => {
      const d = new Date(item.date + "T00:00:00")
      return d >= startOfPreviousMonth && d <= endOfPreviousMonth
    })
    .reduce((sum, item) => sum + item.sales, 0)

  const totalSales = chartData.reduce(
    (sum, item) => sum + item.sales,
    0
  )

  const growth =
    previousMonthSales > 0
      ? ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100
      : 0

  /* =====================
     KPI INSIGHT
  ===================== */

  let kpiInsightMessage = ""
  let kpiInsightColor = "text-gray-600"

  if (chartData.length === 0) {
    kpiInsightMessage =
      "📂 Sube un archivo o descarga el ejemplo para comenzar."
  } else if (previousMonthSales === 0 && currentMonthSales > 0) {
    kpiInsightMessage =
      "🚀 Primer mes con ventas registradas. ¡Buen comienzo!"
    kpiInsightColor = "text-blue-600"
  } else if (growth > 10) {
    kpiInsightMessage =
      "📈 Excelente crecimiento respecto al mes anterior."
    kpiInsightColor = "text-green-600"
  } else if (growth > 0) {
    kpiInsightMessage = "👍 Crecimiento positivo, sigue así."
    kpiInsightColor = "text-green-500"
  } else if (growth < 0) {
    kpiInsightMessage =
      "⚠️ Las ventas bajaron respecto al mes pasado."
    kpiInsightColor = "text-red-500"
  } else {
    kpiInsightMessage = "📊 Las ventas se mantuvieron estables."
  }

  /* =====================
     FORECAST (7 DAYS)
  ===================== */

  const currentMonthData = chartData.filter(item => {
    const d = new Date(item.date + "T00:00:00")
    return d >= startOfCurrentMonth
  })

  const averageDailySales =
    currentMonthData.length > 0
      ? currentMonthSales / currentMonthData.length
      : 0

  const projectionData = Array.from({ length: 7 }, (_, i) => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + i + 1)

    return {
      date: futureDate.toISOString().split("T")[0],
      projected: Math.round(averageDailySales),
    }
  })

  const forecastChartData = [
    ...chartData.map(item => ({
      date: item.date,
      sales: item.sales,
      projected: null,
    })),
    ...projectionData.map(item => ({
      date: item.date,
      sales: null,
      projected: item.projected,
    })),
  ]

  /* =====================
     SAMPLE CSV DOWNLOAD
  ===================== */

  const downloadSampleCSV = () => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(endDate.getFullYear() - 1)

    let csv = "date,sales\n"
    const current = new Date(startDate)
    let baseSales = 80

    while (current <= endDate) {
      const month = current.getMonth()

      const seasonalBoost =
        month === 10 || month === 11 ? 30 :
        month === 5 || month === 6 ? 15 : 0

      baseSales += 0.05
      const noise = Math.floor(Math.random() * 30) - 15

      const sales = Math.max(
        30,
        Math.round(baseSales + seasonalBoost + noise)
      )

      csv += `${current.toISOString().split("T")[0]},${sales}\n`
      current.setDate(current.getDate() + 1)
    }

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "sales_demo_last_12_months.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  /* =====================
     UI
  ===================== */

  return (
    <main className="min-h-screen bg-gray-500 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-white">
          <h1 className="text-3xl font-bold">
            Sales Analytics Dashboard
          </h1>
          <p className="text-gray-200">
            Demo — sube tu archivo y visualiza tus ventas
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow p-4">
          <FileUpload onDataLoaded={setChartData} />

          <div className="flex justify-between text-sm text-gray-600 mt-3">
            <span>¿No tienes datos para probar?</span>
            <button
              onClick={downloadSampleCSV}
              className="text-blue-600 font-medium hover:underline"
            >
              Descargar archivo de ejemplo
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard title="Ventas del mes" value={currentMonthSales} />
          <KpiCard title="Mes anterior" value={previousMonthSales} />
          <KpiCard title="Ventas totales" value={totalSales} />
          <KpiCard
            title="Crecimiento"
            value={`${growth.toFixed(1)}%`}
            highlight
          />
        </section>

        <section className="bg-white rounded-2xl shadow p-4">
          <p className={`text-sm font-medium ${kpiInsightColor}`}>
            {kpiInsightMessage}
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
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

        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Proyección de ventas (7 días)
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#2563eb"
                strokeWidth={2}
                name="Ventas reales"
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#16a34a"
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Proyección"
              />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <footer className="text-center text-gray-300 text-sm">
          Demo MVP — Datos simulados
        </footer>
      </div>
    </main>
  )
}

/* =====================
   COMPONENTS
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
