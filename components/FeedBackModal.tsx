"use client"

import { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

type Props = {
  open: boolean
  onClose: () => void
}

export default function FeedbackModal({ open, onClose }: Props) {
  const [business, setBusiness] = useState("")
  const [comment, setComment] = useState("")
  const [wouldPay, setWouldPay] = useState("")
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const submit = async () => {
    if (!wouldPay) return alert("Selecciona una opción")

    try {
      setLoading(true)
      await addDoc(collection(db, "feedback"), {
        business,
        comment,
        wouldPay,
        createdAt: serverTimestamp(),
      })
      onClose()
    } catch (e) {
      alert("Error guardando feedback")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-3 text-gray-800">
          Tu opinión importa 🙌
        </h2>

        <input
          value={business}
          onChange={e => setBusiness(e.target.value)}
          placeholder="Tipo de negocio"
          className="w-full border rounded p-2 mb-2 text-gray-800"
        />

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="¿Qué fue útil o confuso?"
          className="w-full border rounded p-2 mb-2 text-gray-800"
        />

        <select
          value={wouldPay}
          onChange={e => setWouldPay(e.target.value)}
          className="w-full border rounded p-2 mb-4 text-gray-800"
        >
          <option value="">¿Pagarías por esto?</option>
          <option>Sí</option>
          <option>Tal vez</option>
          <option>No</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancelar</button>
          <button
            onClick={submit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  )
}
