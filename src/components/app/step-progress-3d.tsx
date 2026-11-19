'use client';

import React from 'react';
import { Upload, Languages, Camera, CheckCircle2, FileCheck2 } from 'lucide-react';

export type StepType = 'upload-form' | 'analysis' | 'supporting-documents' | 'review';

interface StepProgress3DProps {
  currentStep: StepType;
}

const steps: { id: StepType; label: string; sublabel: string; icon: any; num: number }[] = [
  { id: 'upload-form', label: '1. Upload Form', sublabel: 'फ़ॉर्म अपलोड', icon: Upload, num: 1 },
  { id: 'analysis', label: '2. Form Guide', sublabel: 'स्पष्टीकरण', icon: Languages, num: 2 },
  { id: 'supporting-documents', label: '3. Attach Documents', sublabel: 'दस्तावेज़', icon: Camera, num: 3 },
  { id: 'review', label: '4. Review & Fill', sublabel: 'समीक्षा एवं डाउनलोड', icon: FileCheck2, num: 4 },
];

export function StepProgress3D({ currentStep }: StepProgress3DProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 px-2 print:hidden">
      {/* 2D Official Government Stepper Banner */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-1 ring-blue-600/30'
                    : isCompleted
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-slate-50/60 border-slate-200 opacity-75'
                }`}
              >
                {/* Step Number / Icon Badge */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span>{step.num}</span>
                  )}
                </div>

                {/* Text Labels */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-bold truncate leading-tight ${
                      isActive
                        ? 'text-blue-900'
                        : isCompleted
                        ? 'text-emerald-900'
                        : 'text-slate-700'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-700 truncate font-medium">
                    {step.sublabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
