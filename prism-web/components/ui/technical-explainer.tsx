'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Code, Database, Sparkles, Cpu } from 'lucide-react';

interface TechnicalExplainerProps {
  title: string;
  description: string;
  sections?: Array<{
    title: string;
    icon?: 'code' | 'database' | 'sparkles' | 'cpu' | 'info';
    content: string | React.ReactNode;
  }>;
  defaultExpanded?: boolean;
  variant?: 'info' | 'success' | 'warning' | 'technical';
}

const iconMap = {
  code: Code,
  database: Database,
  sparkles: Sparkles,
  cpu: Cpu,
  info: Info,
};

const variantStyles = {
  info: 'bg-blue-500/10 border-blue-500/30',
  success: 'bg-green-500/10 border-green-500/30',
  warning: 'bg-yellow-500/10 border-yellow-500/30',
  technical: 'bg-purple-500/10 border-purple-500/30',
};

const variantTextColors = {
  info: 'text-blue-400',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  technical: 'text-purple-400',
};

export function TechnicalExplainer({
  title,
  description,
  sections = [],
  defaultExpanded = false,
  variant = 'info',
}: TechnicalExplainerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border rounded-lg overflow-hidden ${variantStyles[variant]}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Info className={`w-5 h-5 ${variantTextColors[variant]}`} />
          <div className="text-left">
            <h3 className={`font-semibold ${variantTextColors[variant]}`}>{title}</h3>
            <p className="text-sm text-gray-400 mt-0.5">{description}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          {sections.map((section, idx) => {
            const Icon = section.icon ? iconMap[section.icon] : Info;
            return (
              <div key={idx} className="flex gap-3">
                <Icon className={`w-5 h-5 ${variantTextColors[variant]} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{section.title}</h4>
                  {typeof section.content === 'string' ? (
                    <p className="text-sm text-gray-400 leading-relaxed">{section.content}</p>
                  ) : (
                    section.content
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'sql' }: CodeBlockProps) {
  return (
    <pre className="bg-gray-900 rounded p-3 text-xs text-gray-300 overflow-x-auto border border-gray-700">
      <code>{code}</code>
    </pre>
  );
}

interface ProcessStepProps {
  steps: Array<{
    number: number;
    title: string;
    description: string;
  }>;
}

export function ProcessSteps({ steps }: ProcessStepProps) {
  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <div key={step.number} className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
            {step.number}
          </div>
          <div className="flex-1">
            <h5 className="font-medium text-white">{step.title}</h5>
            <p className="text-sm text-gray-400 mt-0.5">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
