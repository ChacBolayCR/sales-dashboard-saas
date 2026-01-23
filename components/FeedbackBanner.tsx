"use client"

type FeedbackBannerProps = {
  onFeedbackClick: () => void
  onClose: () => void
}

export default function FeedbackBanner({
  onFeedbackClick,
  onClose,
}: FeedbackBannerProps) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-4xl -translate-x-1/2 rounded-xl border border-gray-300 bg-white shadow-lg">
      <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-gray-900">
            💬 Tu opinión importa
          </p>
          <p className="text-sm text-gray-700">
            Esta herramienta está en prueba. ¿Te tomarías{" "}
            <span className="font-medium">30 segundos</span> para decirnos qué te
            pareció?
          </p>
          <p className="text-xs text-gray-500">
            Sin registro · Sin ventas · Solo mejorar el producto
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onFeedbackClick}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Dar feedback
          </button>

          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Más tarde
          </button>
        </div>
      </div>
    </div>
  )
}
