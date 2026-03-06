'use client'

import { Check } from "lucide-react"

const STEPS = [
  { number: 1, label: "Chapa" },
  { number: 2, label: "Retalhos" },
  { number: 3, label: "Confirmação" },
]

interface StepperProps {
  currentStep: number
}

export function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`
                w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                transition-all duration-300 border-2
                ${index <= currentStep
                  ? "bg-zinc-900 border-zinc-900 text-white"
                  : "bg-white border-zinc-300 text-zinc-500"
                }
              `}
            >
              {index < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={`text-xs font-medium transition-colors duration-300 ${
                index <= currentStep ? "text-zinc-900" : "text-zinc-500"
              }`}
            >
              {step.label}
            </span>
          </div>

          {index < STEPS.length - 1 && (
            <div className="flex items-center pb-6">
              <div
                className={`w-20 sm:w-28 h-0.5 mx-2 transition-colors duration-500 ${
                  index < currentStep ? "bg-zinc-900" : "bg-zinc-200"
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
