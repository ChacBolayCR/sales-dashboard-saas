"use client"

import { useState } from "react"
import { ReactNode } from "react"
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

function normalizeData(rawData: any[]): ChartItem[] {
  return rawData
    .map(item => ({
      date: String(item.date).trim(),
      sales: Number(item.sales),
    }))
    .filter(item => item.date && !isNaN(item.sales))
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
      const d = new Date(item.date + "T00:00:00")
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((sum, item) => sum + (item.sales || 0), 0)

  const previousMonthSales = chartData
    .filter(item => {
      const d = new Date(item.date + "T00:00:00") 
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

  const currentMonthData = chartData.filter(item => {
    const d = new Date(item.date + "T00:00:00")
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const previousMonthData = chartData.filter(item => {
    const d = new Date(item.date + "T00:00:00")
    return d.getMonth() === currentMonth - 1 && d.getFullYear() === currentYear
  })

  const comparisonData = currentMonthData.map(item => {
    const day = new Date(item.date + "T00:00:00").getDate()

    const previousDay = previousMonthData.find(prev => {
      return new Date(prev.date).getDate() === day
    })

    return {
      day,
      current: item.sales || 0,
      previous: previousDay?.sales || 0,
    }
  })

  const daysWithSales = currentMonthData.length

  const averageDailySales =
    daysWithSales > 0
      ? currentMonthSales / daysWithSales
      : 0

  const lastRealSale =
      chartData.length > 0
      ? chartData[chartData.length - 1].sales
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
  {
    date: chartData[chartData.length - 1]?.date,
    sales: null,
    projected: lastRealSale,
  },
  ...projectionData.map(item => ({
    date: item.date,
    sales: null,
    projected: item.projected,
  })),
]

const growthColor =
  growth > 0
    ? "text-green-600"
    : growth < 0
    ? "text-red-600"
    : "text-gray-600"

const growthIcon =
  growth > 0 ? "▲" : growth < 0 ? "▼" : "●"


let insightMessage = "Sube un archivo para ver insights automáticos."

if (chartData.length > 0) {
  if (growth > 10) {
    insightMessage =
      "🚀 Excelente crecimiento este mes. Mantén las estrategias actuales."
  } else if (growth > 0) {
    insightMessage =
      "📈 Crecimiento positivo, aunque moderado. Hay margen para optimizar."
  } else if (growth < 0) {
    insightMessage =
      "⚠️ Las ventas bajaron respecto al mes anterior. Revisa campañas y stock."
  } else {
    insightMessage =
      "➖ Ventas estables. Considera acciones para impulsar el crecimiento."
  }
}

let chartInsight = "Carga datos para analizar la evolución."

if (chartData.length > 1) {
  const sorted = [...chartData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const first = sorted[0].sales
  const last = sorted[sorted.length - 1].sales

  const maxDay = sorted.reduce((prev, curr) =>
    curr.sales > prev.sales ? curr : prev
  )

  const minDay = sorted.reduce((prev, curr) =>
    curr.sales < prev.sales ? curr : prev
  )

  if (last > first) {
    chartInsight = `📈 Tendencia positiva. Pico de ventas el ${maxDay.date}.`
  } else if (last < first) {
    chartInsight = `📉 Tendencia a la baja. Punto más débil el ${minDay.date}.`
  } else {
    chartInsight = "➖ Ventas estables durante el periodo analizado."
  }
}

let recommendation =
  "Sube un archivo para recibir recomendaciones automáticas."

if (chartData.length > 0) {
  if (growth > 10) {
    recommendation =
      "Aumenta inventario y refuerza campañas: la demanda está creciendo."
  } else if (growth > 0) {
    recommendation =
      "Optimiza precios o promociones para acelerar el crecimiento."
  } else if (growth < 0) {
    recommendation =
      "Revisa canales de venta y campañas: posible caída de conversión."
  } else {
    recommendation =
      "Lanza una acción puntual (descuento o bundle) para romper la estabilidad."
  }
}



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
          <p className="text-sm text-gray-200">
            Obtén una visión clara del desempeño de tus ventas en segundos.
            Sube tu archivo y descubre tendencias, crecimiento y proyecciones.
          </p>

        </header>

        {/* Upload */}
        <div className="mb-4">
          <h2 className="text-lg text-gray-200 font-semibold">
            Sube tu archivo de ventas
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            El archivo debe contener una columna de fecha y una de ventas.
          </p>
        </div>

        <p className="text-xs text-gray-200 mb-4">
          Columnas comunes: <strong>fecha</strong>, <strong>date</strong>,{" "}
          <strong>ventas</strong>, <strong>sales</strong>, <strong>total</strong>
        </p>

        <div className="bg-white rounded-2xl shadow p-4">
          <FileUpload
            onDataLoaded={(rawData) => {
            const cleanData = normalizeData(rawData)
            setChartData(cleanData)
            }}
          />
        </div>

          {chartData.length === 0 && (
  <section className="bg-white rounded-2xl shadow p-8 text-center">
    <h3 className="text-xl font-semibold text-gray-800">
      Aún no hay datos cargados
    </h3>

    <p className="text-gray-600 mt-2 max-w-md mx-auto">
      Sube un archivo de ventas para ver métricas clave, comparativos mensuales
      y una proyección automática.
    </p>

    <ul className="text-sm text-gray-500 mt-4 space-y-1">
      <li>• Ventas del mes y acumulado</li>
      <li>• Comparación con el mes anterior</li>
      <li>• Tendencia y proyección a 7 días</li>
    </ul>

    <p className="text-xs text-gray-400 mt-4">
      Tip: puedes usar nuestro archivo de ejemplo si aún no tienes datos.
    </p>
  </section>
)}


<section className="bg-white border-l-4 border-blue-600 rounded-xl p-4 shadow">
  <p className="text-sm text-gray-700">
    <strong>Recomendación:</strong> {recommendation}
  </p>
</section>

{chartData.length === 0 && (
  <p className="text-sm text-gray-300">
    Los KPIs aparecerán aquí una vez cargues tu archivo
  </p>
)}


        {/* KPI CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard
            title="Ventas del mes"
            value={
              currentMonthSales === 0
              ? "Sin datos en el mes actual"
              : currentMonthSales
            }
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
            value={
              <span className={growthColor}>
              {growthIcon} {growth.toFixed(1)}%
            </span>
            }
            description={
              growth > 0
              ? "Incremento respecto al mes anterior"
              : growth < 0
              ? "Disminución respecto al mes anterior"
              : "Sin variación mensual"
            }
          />

        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            {insightMessage}
          </p>
        </section>

        {/* GRÁFICO */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Evolución de ventas en el tiempo
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

<p className="text-sm text-gray-200 mt-3">
  {chartInsight}
</p>

{chartData.length === 0 && (
  <p className="text-gray-500 text-sm mb-2">
    La proyección se genera automáticamente al detectar ventas recientes.
  </p>
)}

<section className="bg-white rounded-2xl shadow p-6">
  <h2 className="text-lg font-semibold mb-4 text-gray-800">
    Proyección estimada de ventas (próximos 7 días)
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
        connectNulls
      />
    </LineChart>
  </ResponsiveContainer>

  <p className="text-sm text-gray-500 mt-2">
  Proyección estimada usando el promedio diario del mes actual.
  No sustituye un forecast financiero formal.
</p>

</section>

          <section className="bg-white rounded-2xl shadow p-6">
  <h2 className="text-lg font-semibold mb-4 text-gray-800">
    Ventas: mes actual vs anterior
  </h2>

  {comparisonData.length === 0 ? (
    <p className="text-gray-500">
  Se necesitan datos de al menos dos meses para comparar.
</p>

  ) : (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={comparisonData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="current"
          stroke="#2563eb"
          strokeWidth={2}
          name="Mes actual"
        />
        <Line
          type="monotone"
          dataKey="previous"
          stroke="#9ca3af"
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Mes anterior"
        />
      </LineChart>
    </ResponsiveContainer>
  )}
</section>


        {/* Watermark */}
        <footer className="text-center text-gray-300 text-sm">
          <p className="text-center text-xs text-gray-200 mt-6">
            Demo MVP — No se almacenan datos
          </p>  
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
  description,
}: {
  title: string
  value: ReactNode
  highlight?: boolean
  description?: string
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

      {description && (
      <p className="text-xs text-gray-500 mt-1">
        {description}
      </p>
        )}
    </div>
  )
}

