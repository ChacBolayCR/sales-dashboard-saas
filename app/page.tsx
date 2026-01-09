'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import SalesChart from '@/components/SalesChart'
import KpiCard from "@/components/KpiCard";
import TopProductsTable from "@/components/TopProductsTable";

export default function Home() {
  const [chartData, setChartData] = useState<any[]>([])

  const totalSales = chartData.reduce(
    (sum, item) => sum + (item.sales || 0),
    0
  )
  const averageSales =
    chartData.length > 0 ? Math.round(totalSales / chartData.length) : 0
  const bestMonth =
    chartData.length > 0
      ? chartData.reduce((max, item) =>
        item.sales > max.sales ? item : max
      ).month
    : '-'

  return (
    <main className="min-h-screen bg-slate-900 p-10">
      <h1 className="text-4xl tracking-tight font-bold mb-6 text-white">
        Dashboard de Ventas
      </h1>
      <FileUpload onDataLoaded={setChartData} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard
          title="Ventas Totales"
          value={`₡${totalSales.toLocaleString()}`}
          />

        <KpiCard
          title="Promedio Mensual"
          value={`₡${averageSales.toLocaleString()}`}
        />

        <KpiCard
          title="Mejor Mes"
          value={bestMonth}
        />
      </div>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <SalesChart data={chartData} />
        <TopProductsTable data={chartData} />
      </div>
      <div className="fixed bottom-3 right-4 text-xs text-gray-400 opacity-70">
        Demo gratuita
      </div>
      <div className="mt-6 text-sm text-center">
        <a
          href="https://wa.me/50683788368?text=Hola,%20prob%C3%A9%20la%20demo%20y%20quiero%20dejar%20feedback"
          target="_blank"
          className="text-blue-600 hover:text-blue-800 underline"
        >
        ¿Te fue útil esta demo? Escríbenos por WhatsApp
        </a>
      </div>

    </main>
  );
}
