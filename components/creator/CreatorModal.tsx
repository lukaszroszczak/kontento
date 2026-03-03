'use client'

import { useState } from 'react'

import { CreatorSidebar } from './CreatorSidebar'
import { Step1Profile } from './steps/Step1Profile'
import { Step2Research } from './steps/Step2Research'
import { Step3Topics } from './steps/Step3Topics'
import { Step4Content } from './steps/Step4Content'
import { Step5Image } from './steps/Step5Image'
import { Step6Publish } from './steps/Step6Publish'
import type { CreatorState } from '@/types'

const INITIAL_STATE: CreatorState = {
  step: 1,
  brand: {},
  topic: '',
  content: '',
  imageUrl: null,
  platforms: ['instagram'],
  hashtags: [],
  scheduledAt: null,
  publishNow: true,
  tone: 'Friendly',
  language: 'Polish',
  includeHashtags: true,
  includeEmoji: true,
}

interface CreatorModalProps {
  onClose: () => void
}

export function CreatorModal({ onClose }: CreatorModalProps) {
  const [step, setStep] = useState(1)
  const [state, setState] = useState<CreatorState>(INITIAL_STATE)

  const update = (partial: Partial<CreatorState>) => {
    setState((s) => ({ ...s, ...partial }))
  }

  const next = () => setStep((s) => Math.min(s + 1, 6))
  const back = () => setStep((s) => Math.max(s - 1, 1))

  return (
    <div
      className="fixed inset-0 z-[300] flex items-stretch justify-center bg-bg/95 backdrop-blur-xl animate-fade-in"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-6 w-9 h-9 rounded-[10px] bg-surface2 border border-border text-muted hover:text-ink hover:border-border-active transition-all flex items-center justify-center text-lg z-10"
        title="Zamknij"
      >
        ×
      </button>

      {/* Logo */}
      <div className="absolute top-4 left-6 font-syne font-[800] text-[1.1rem] tracking-[-0.03em]">
        konte<span className="text-accent">n</span>to
      </div>

      {/* Layout */}
      <div className="flex w-full max-w-[1100px] mx-auto mt-[56px]">

        {/* Sidebar */}
        <CreatorSidebar currentStep={step} onStepClick={setStep} />

        {/* Main content */}
        <main
          className="flex-1 overflow-y-auto px-12 py-10 max-w-[860px] max-[900px]:px-6 max-[900px]:py-6"
          key={step} // remount for animation
        >
          <div className="animate-fade-up">
            {step === 1 && (
              <Step1Profile state={state} onChange={update} onNext={next} />
            )}
            {step === 2 && (
              <Step2Research state={state} onNext={next} onBack={back} />
            )}
            {step === 3 && (
              <Step3Topics state={state} onChange={update} onNext={next} onBack={back} onSkip={next} />
            )}
            {step === 4 && (
              <Step4Content state={state} onChange={update} onNext={next} onBack={back} />
            )}
            {step === 5 && (
              <Step5Image state={state} onChange={update} onNext={next} onBack={back} onSkip={next} />
            )}
            {step === 6 && (
              <Step6Publish state={state} onChange={update} onBack={back} onClose={onClose} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
