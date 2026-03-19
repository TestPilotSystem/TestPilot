"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import FlashcardViewer from "@/components/flashcards/FlashcardViewer";

interface Card {
  id: string;
  pregunta: string;
  respuesta: string;
  explicacion: string;
}

interface Deck {
  id: string;
  name: string;
  topicName: string;
  cards: Card[];
}

export default function FlashcardDeckPage() {
  const params = useParams();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const deckId = params.deckId as string;
    fetch(`/api/student/flashcards/${deckId}`)
      .then((res) => {
        if (!res.ok) throw new Error("No encontrado");
        return res.json();
      })
      .then(setDeck)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.deckId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0f1e] flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-400" size={40} />
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="fixed inset-0 bg-[#0a0f1e] flex items-center justify-center">
        <p className="text-red-400 font-bold">{error || "Deck no encontrado"}</p>
      </div>
    );
  }

  return <FlashcardViewer deckName={deck.name} cards={deck.cards} />;
}
