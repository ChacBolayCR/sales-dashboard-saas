"use client"

import { useState, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts"
import jsPDF from "jspdf"
import FileUpload from "@/components/FileUpload"

/* =====================
   TYPES
===================== */

type ChartItem = {
  date: string
  sales: number
  product?: string
}

/* =====================
   PAGE
===================== */

export default function Home() {
  const [data, setData] = useState<ChartItem[]>([])
  const [productFilter, setProductFilter] = useState("All")
  const [rangeFilter, setRangeFilter] = useState("90d")

  /* =====================
     FILTERS
  ===================== */

  const filteredData = useMemo(() => {
    let result = [...data]

    if (productFilter !== "All") {
      result = result.filter(d => d.product === productFilter)
    }

    const today = new Date()
    if (rangeFilter !== "all") {
      const days =
        rangeFilter === "30d" ? 30 :
        rangeFilter === "90d" ? 90 :
        180

      const limit = new Date()
      limit.setDate(today.getDate() - days)

      result = result.filter(
        d => new Date(d.date + "T00:00:00") >= limit
      )
    }

    return result
  }, [data, productFilter, rangeFilter])

  /* =====================
     KPI LOGIC
  ===================== */

  const monthlyMap: Record<string, number> = {}

  filteredData.forEach(d => {
    const date = new Date(d.date + "T00:00:00")
    const key = `${date.getFullYear()}-${date.getMonth()}`
    monthlyMap[key] = (monthlyMap[key] || 0) + d.sales
  })

  const monthlyTotals = Object.values(monthlyMap)
  const averageMonthlySales =
    monthlyTotals.length > 0
      ? monthlyTotals.reduce((a, b) => a + b, 0) /
        monthlyTotals.length
      : 0

  const currentMonthKey = (() => {
    const now = new Date()
    return `${now.getFullYear()}-${now.getMonth()}`
  })()

  const currentMonthSales = monthlyMap[currentMonthKey] || 0
  const smartDifference = currentMonthSales - averageMonthlySales

  /* =====================
     INSIGHT
  ===================== */

  let insight = "📊 Ventas dentro de lo normal."
  let insightColor = "text-gray-600"

  if (smartDifference > averageMonthlySales * 0.15) {
    insight = "🚀 Mes excepcional, muy por encima de lo normal."
    insightColor = "text-green-600"
  } else if (smartDifference > 0) {
    insight = "👍 Buen mes, ventas saludables."
    insightColor = "text-green-500"
  } else if (smartDifference < -averageMonthlySales * 0.15) {
    insight = "🚨 Ventas muy por debajo de lo esperado."
    insightColor = "text-red-600"
  }

  /* =====================
     FORECAST (FUTURE ONLY)
  ===================== */

  const dailyAvg =
    filteredData.length > 0
      ? filteredData.reduce((s, d) => s + d.sales, 0) /
        filteredData.length
      : 0

  const forecastData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i + 1)
    return {
      date: date.toISOString().split("T")[0],
      projected: Math.round(dailyAvg),
    }
  })

  /* =====================
     TOP PRODUCTS
  ===================== */

  const productTotals: Record<string, number> = {}

  data.forEach(d => {
    if (!d.product) return
    productTotals[d.product] =
      (productTotals[d.product] || 0) + d.sales
  })

  const topProducts = Object.entries(productTotals)
    .map(([product, sales]) => ({ product, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)

  /* =====================
     EXPORT PDF
  ===================== */

  const exportPDF = () => {
    const doc = new jsPDF()
    let y = 20

    doc.setFontSize(18)
    doc.text("Reporte de Ventas", 14, y)
    y += 10

    doc.setFontSize(11)
    doc.text(
      `Producto: ${productFilter} | Rango: ${rangeFilter}`,
      14,
      y
    )
    y += 10

    doc.text(`Ventas mes actual: $${currentMonthSales.toFixed(0)}`, 14, y)
    y += 6
    doc.text(`Promedio mensual: $${averageMonthlySales.toFixed(0)}`, 14, y)
    y += 6
    doc.text(`Diferencia: $${smartDifference.toFixed(0)}`, 14, y)
    y += 10

    doc.text("Insight:", 14, y)
    y += 6
    doc.text(insight.replace(/📊|🚀|👍|🚨/g, ""), 14, y)
    y += 10

    doc.text("Top productos:", 14, y)
    y += 6

    topProducts.forEach(p => {
      doc.text(`• ${p.product}: $${p.sales}`, 18, y)
      y += 6
    })

    doc.save("reporte_ventas.pdf")
  }

  /* =====================
     UI
  ===================== */

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            Sales Analytics
          </h1>

          <p className="text-gray-700">
            Dashboard simple para entender tus ventas
          </p>

        </header>

        <FileUpload onDataLoaded={setData} />

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={productFilter}
            onChange={e => setProductFilter(e.target.value)}
            className="border rounded p-2 text-gray-700"
          >
            <option value="All">Todos los productos</option>
            {[...new Set(data.map(d => d.product))].map(p =>
              p ? <option key={p}>{p}</option> : null
            )}
          </select>

          <select
            value={rangeFilter}
            onChange={e => setRangeFilter(e.target.value)}
            className="border rounded p-2 text-gray-700"
          >
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="180d">Últimos 6 meses</option>
            <option value="all">Todo</option>
          </select>

          <button
            onClick={exportPDF}
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            Exportar PDF
          </button>
        </div>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Kpi text-gray-800 title="Mes actual" value={currentMonthSales} />
          <Kpi text-gray-800 title="Promedio mensual" value={averageMonthlySales} />
          <Kpi text-gray-800 title="Diferencia vs normal" value={smartDifference} />
          <Kpi text-gray-800 title="Productos activos" value={Object.keys(productTotals).length} />
        </section>

        <p className={`font-medium ${insightColor}`}>{insight}</p>

        {/* Charts */}
        <section className="font-semibold text-gray-800 mb-2">
          <Chart title="Evolución de ventas">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#374151", fontSize: 12 }}
              />

              <YAxis
                tick={{ fill: "#374151", fontSize: 12 }}
              />

              <Tooltip />
              <Legend />
              <Line dataKey="sales" stroke="#2563eb" />
            </LineChart>
          </Chart>

          <Chart title="Top productos">
            <BarChart data={topProducts}>
              <XAxis
                dataKey="date"
                tick={{ fill: "#374151", fontSize: 12 }}
              />

              <YAxis
                tick={{ fill: "#374151", fontSize: 12 }}
              />

              <Tooltip />
              <Bar dataKey="sales" fill="#16a34a" />
            </BarChart>
          </Chart>
        </section>
        
        <section className="font-semibold text-gray-800 mb-2">
          <Chart title="Proyección de ventas (7 días)">
            <LineChart data={forecastData}>
              <XAxis
                dataKey="date"
                tick={{ fill: "#374151", fontSize: 12 }}
              />

              <YAxis
                tick={{ fill: "#374151", fontSize: 12 }}
              />

              <Tooltip />
              <Line dataKey="projected" stroke="#16a34a" strokeDasharray="5 5" />
            </LineChart>
          </Chart>
        </section>
      </div>
    </main>
  )
}

/* =====================
   UI HELPERS
===================== */

function Kpi({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm font-semibold text-gray-700">
        {title}
      </p>
      <p className="text-2xl font-bold text-gray-900">
        {value.toFixed(0)}
      </p>
    </div>
  )
}


function Chart({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {children as any}
      </ResponsiveContainer>
    </div>
  )
}
