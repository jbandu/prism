"use client";

import { CheckCircle2, Loader2, Circle } from "lucide-react";

export interface NegotiationStep {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed";
  description?: string;
}

interface NegotiationProgressProps {
  steps: NegotiationStep[];
}

export function NegotiationProgress({ steps }: NegotiationProgressProps) {
  return (
    <div className="space-y-4 py-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {step.status === "completed" && (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
            {step.status === "in_progress" && (
              <Loader2 className="w-5 h-5 text-prism-primary animate-spin" />
            )}
            {step.status === "pending" && (
              <Circle className="w-5 h-5 text-gray-300" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`font-medium text-sm ${
                  step.status === "completed"
                    ? "text-green-600"
                    : step.status === "in_progress"
                    ? "text-prism-primary"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
              {step.status === "in_progress" && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse delay-75">●</span>
                  <span className="animate-pulse delay-150">●</span>
                </span>
              )}
            </div>
            {step.description && (
              <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
            )}
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className="absolute left-[10px] mt-8 w-0.5 h-8 bg-gray-200" />
          )}
        </div>
      ))}
    </div>
  );
}
