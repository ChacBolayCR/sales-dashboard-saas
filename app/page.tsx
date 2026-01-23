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
import FeedbackModal from "@/components/FeedBackModal"

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

  const [showFeedbackBanner, setShowFeedbackBanner] = useState(true)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  /* =====================
     FILTERED DATA
  ===================== */

  const filteredData = useMemo(() => {
    let result = [...data]

    if (productFilter !== "All") {
      result = result.filter(d => d.product === productFilter)
    }

    if (rangeFilter !== "all") {
      const days =
        rangeFilter === "30d" ? 30 :
        rangeFilter === "90d" ? 90 :
        180

      const limit = new Date()
      limit.setDate(limit.getDate() - days)

      result = result.filter(
        d => new Date(d.date + "T00:00:00") >= limit
      )
    }

    return result
  }, [data, productFilter, rangeFilter])

  /* =====================
     KPI LOGIC (SMART)
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
      ? monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length
      : 0

  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`
  const currentMonthSales = monthlyMap[currentMonthKey] || 0
  const smartDifference = currentMonthSales - averageMonthlySales

  /* =====================
     KPI INSIGHT
  ===================== */

  let insight = "📊 Ventas dentro del comportamiento normal."
  let insightColor = "text-gray-800"

  if (smartDifference > averageMonthlySales * 0.15) {
    insight = "🚀 Mes excepcional: ventas muy por encima de lo normal."
    insightColor = "text-green-700"
  } else if (smartDifference > 0) {
    insight = "👍 Buen mes: ventas por encima del promedio."
    insightColor = "text-green-600"
  } else if (smartDifference < -averageMonthlySales * 0.15) {
    insight = "⚠️ Mes débil: ventas por debajo de lo esperado."
    insightColor = "text-red-600"
  }

  /* =====================
     FORECAST (FUTURE)
  ===================== */

  const dailyAvg =
    filteredData.length > 0
      ? filteredData.reduce((s, d) => s + d.sales, 0) / filteredData.length
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
    doc.text(`Diferencia vs normal: $${smartDifference.toFixed(0)}`, 14, y)
    y += 10

    doc.text("Conclusión:", 14, y)
    y += 6
    doc.text(insight.replace(/🚀|👍|⚠️|📊/g, ""), 14, y)

    doc.save("reporte_ventas.pdf")
  }

  /* =====================
     SAMPLE CSV
  ===================== */

  const downloadSampleCSV = () => {
    const end = new Date()
    const start = new Date()
    start.setFullYear(end.getFullYear() - 1)

    let csv = "date,sales,product\n"
    const products = ["Res", "Cerdo", "Pollo", "Embutidos"]

    const current = new Date(start)
    let base = 80

    while (current <= end) {
      base += 0.05
      const noise = Math.floor(Math.random() * 30) - 15
      const sales = Math.max(30, Math.round(base + noise))
      const product = products[Math.floor(Math.random() * products.length)]

      csv += `${current.toISOString().split("T")[0]},${sales},${product}\n`
      current.setDate(current.getDate() + 1)
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "sales_demo_full.csv"
    link.click()
    URL.revokeObjectURL(url)
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
            Entiende tus ventas sin ser experto en datos
          </p>
        </header>

        {showFeedbackBanner && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-blue-900">
                💬 Ayúdanos a mejorar esta herramienta
              </p>
              <p className="text-sm text-blue-800">
                Tu opinión nos ayuda a construir algo útil (1 minuto)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Dar feedback
              </button>
              <button
                onClick={() => setShowFeedbackBanner(false)}
                className="text-sm text-blue-700 underline"
              >
                Ahora no
              </button>
            </div>
          </div>
        )}

        {/* Upload */}
        <div className="bg-white p-4 rounded shadow space-y-3">
          <FileUpload onDataLoaded={setData} />
          <div className="flex justify-between text-sm text-gray-700">
            <span>¿No tienes datos?</span>
            <button
              onClick={downloadSampleCSV}
              className="text-blue-700 font-semibold hover:underline"
            >
              Descargar archivo demo
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <select
            value={productFilter}
            onChange={e => setProductFilter(e.target.value)}
            className="border rounded p-2 text-gray-800"
          >
            <option value="All">Todos los productos</option>
            {[...new Set(data.map(d => d.product))].map(p =>
              p ? <option key={p}>{p}</option> : null
            )}
          </select>

          <select
            value={rangeFilter}
            onChange={e => setRangeFilter(e.target.value)}
            className="border rounded p-2 text-gray-800"
          >
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="180d">Últimos 6 meses</option>
            <option value="all">Todo</option>
          </select>

          <button
            onClick={exportPDF}
            className="bg-gray-900 text-white px-4 py-2 rounded"
          >
            Exportar resumen
          </button>
        </div>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Kpi title="Ventas del mes" value={currentMonthSales} help="Mes actual" />
          <Kpi title="Promedio mensual" value={averageMonthlySales} help="Promedio histórico" />
          <Kpi title="Diferencia vs normal" value={smartDifference} help="Comparación inteligente" />
          <Kpi title="Productos activos" value={Object.keys(productTotals).length} help="Con ventas" />
        </section>

        <p className={`font-medium ${insightColor}`}>{insight}</p>

        {/* Charts */}
        <section className="grid md:grid-cols-2 gap-6">
          <Chart title="Evolución de ventas" subtitle="Ventas en el tiempo">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="sales" stroke="#2563eb" />
            </LineChart>
          </Chart>

          <Chart title="Top productos" subtitle="Más vendidos">
            <BarChart data={topProducts}>
              <XAxis dataKey="product" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#16a34a" />
            </BarChart>
          </Chart>
        </section>

        <Chart title="Proyección (7 días)" subtitle="Estimación futura">
          <LineChart data={forecastData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              dataKey="projected"
              stroke="#16a34a"
              strokeDasharray="5 5"
            />
          </LineChart>
        </Chart>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        open={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </main>
  )
}

/* =====================
   COMPONENTS
===================== */

function Kpi({
  title,
  value,
  help,
}: {
  title: string
  value: number
  help: string
}) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      <p className="text-2xl font-bold text-gray-900">
        {value.toFixed(0)}
      </p>
      <p className="text-xs text-gray-500">{help}</p>
    </div>
  )
}

function Chart({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-xs text-gray-600 mb-2">{subtitle}</p>
      <ResponsiveContainer width="100%" height={300}>
        {children as any}
      </ResponsiveContainer>
    </div>
  )
}
