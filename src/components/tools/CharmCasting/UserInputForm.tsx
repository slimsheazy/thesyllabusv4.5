"use client"

import React, { useState } from "react"
import { motion } from "motion/react"
import { triggerFlintStrike } from "./sound-effects"

interface UserInputFormProps {
  question: string
  setQuestion: (question: string) => void
  onSubmit: () => void
}

export default function UserInputForm({ question, setQuestion, onSubmit }: UserInputFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted with question:", question)

    setIsSubmitting(true)
    triggerFlintStrike()

    // Small delay for UX
    setTimeout(() => {
      console.log("Calling onSubmit")
      onSubmit()
      setIsSubmitting(false)
    }, 500)
  }

  // Allow submission even without a question (question is optional)
  const canSubmit = !isSubmitting

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="space-y-2">
        <label htmlFor="question" className="text-sm font-light tracking-wide text-archive-ink/80">
          What guidance do you seek? (optional)
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your question to the cosmos... or leave blank for general guidance"
          className="w-full min-h-[100px] bg-archive-bg border border-archive-line rounded-lg p-3 text-archive-ink placeholder:text-archive-ink/40 focus:border-archive-accent/40 focus:ring-1 focus:ring-archive-accent/20 resize-none outline-none transition-all"
          disabled={isSubmitting}
        />
      </div>

      <motion.button
        type="submit"
        disabled={!canSubmit}
        className={`w-full py-3 px-6 rounded-full text-sm font-light tracking-wide transition-all duration-300 ${
          canSubmit
            ? "cosmic-glow bg-archive-bg border-2 border-archive-line hover:border-archive-accent/50 hover:bg-archive-ink hover:text-archive-bg cursor-pointer text-archive-ink"
            : "opacity-50 cursor-not-allowed bg-archive-bg border-2 border-archive-line text-archive-ink/40"
        }`}
        whileHover={canSubmit ? { scale: 1.02 } : {}}
        whileTap={canSubmit ? { scale: 0.98 } : {}}
      >
        {isSubmitting ? "Consulting the stars..." : "begin divination"}
      </motion.button>

      {/* Debug info */}
      <div className="text-xs text-archive-ink/30 text-center">
        Debug: canSubmit={String(canSubmit)}, isSubmitting={String(isSubmitting)}
      </div>
    </motion.form>
  )
}
