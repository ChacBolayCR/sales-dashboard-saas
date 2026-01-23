import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

type SaveFeedbackInput = {
  mostUseful: string
  confusingPart: string
  wouldPay: string
  comment?: string
}

export async function saveFeedback(data: SaveFeedbackInput) {
  await addDoc(collection(db, "feedback"), {
    ...data,
    createdAt: serverTimestamp(),
  })
}
