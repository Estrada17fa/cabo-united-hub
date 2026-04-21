import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check, X, Trophy } from "lucide-react";

const MOCK_QUESTIONS = [
  {
    q: "¿En qué año fue fundado Los Cabos United?",
    options: ["2020", "2021", "2022", "2023"],
    correct: 2,
  },
  {
    q: "¿Cuál es el estadio del club?",
    options: ["Estadio Azteca", "Estadio Don Koll", "Estadio Akron", "Estadio Cuauhtémoc"],
    correct: 1,
  },
  {
    q: "¿En qué liga juega Los Cabos United?",
    options: ["Liga MX", "Liga de Expansión", "Liga Premier", "Liga TDP"],
    correct: 2,
  },
  {
    q: "¿Qué color predomina en el uniforme local?",
    options: ["Rojo", "Azul", "Cyan", "Verde"],
    correct: 2,
  },
  {
    q: "¿Cuál fue el año en que el club se coronó campeón?",
    options: ["2022", "2023", "2024", "2025"],
    correct: 2,
  },
];

export function TriviaGame({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const isFinished = step >= MOCK_QUESTIONS.length;
  const correctCount = answers.filter((a, i) => a === MOCK_QUESTIONS[i].correct).length;

  const handleNext = () => {
    if (selected === null) return;
    setAnswers([...answers, selected]);
    setSelected(null);
    setStep(step + 1);
  };

  if (isFinished) {
    return (
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring" }}
          className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: "hsl(45 100% 50% / 0.15)", border: "2px solid hsl(45 100% 50% / 0.4)" }}
        >
          <Trophy className="w-12 h-12 text-primary" style={{ color: "hsl(45 100% 60%)" }} />
        </motion.div>
        <h3 className="text-2xl font-extrabold mb-2">
          {correctCount}/{MOCK_QUESTIONS.length} correctas
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Ganaste <span className="text-primary font-bold">+{correctCount * 5} pts</span>
        </p>
        <Button
          onClick={onClose}
          className="font-extrabold uppercase tracking-widest"
          style={{ backgroundColor: "hsl(180 100% 50%)", color: "hsl(0 0% 8%)" }}
        >
          Continuar
        </Button>
      </div>
    );
  }

  const current = MOCK_QUESTIONS[step];
  const progress = ((step + 1) / MOCK_QUESTIONS.length) * 100;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          <span>Pregunta {step + 1}/{MOCK_QUESTIONS.length}</span>
          <span className="text-primary font-bold">+5 pts c/u</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <h3 className="text-base font-extrabold leading-snug">{current.q}</h3>
          <div className="space-y-2">
            {current.options.map((opt, i) => {
              const isSelected = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className="w-full text-left rounded-full px-4 py-3 border text-sm font-medium flex items-center gap-3 transition-all"
                  style={{
                    backgroundColor: isSelected ? "hsl(180 100% 50% / 0.15)" : "hsl(0 0% 0% / 0.5)",
                    borderColor: isSelected ? "hsl(180 100% 50%)" : "hsl(0 0% 100% / 0.1)",
                    color: isSelected ? "hsl(180 100% 70%)" : "hsl(0 0% 90%)",
                  }}
                >
                  <span
                    className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{
                      borderColor: isSelected ? "hsl(180 100% 50%)" : "hsl(0 0% 100% / 0.2)",
                      backgroundColor: isSelected ? "hsl(180 100% 50%)" : "transparent",
                      color: isSelected ? "hsl(0 0% 8%)" : "hsl(0 0% 60%)",
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <Button
        onClick={handleNext}
        disabled={selected === null}
        className="w-full font-extrabold uppercase tracking-widest"
        style={{
          backgroundColor: selected !== null ? "hsl(142 76% 50%)" : "hsl(0 0% 15%)",
          color: selected !== null ? "hsl(0 0% 8%)" : "hsl(0 0% 50%)",
        }}
      >
        {step === MOCK_QUESTIONS.length - 1 ? "Finalizar" : "Siguiente"}
      </Button>
    </div>
  );
}