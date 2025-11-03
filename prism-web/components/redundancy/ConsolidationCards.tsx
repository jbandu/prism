'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface ConsolidationCardsProps {
  recommendations: Array<{
    id: string;
    software_to_keep: {
      software_name: string;
      vendor_name: string;
      annual_cost: number;
    };
    software_to_remove: Array<{
      software_name: string;
      vendor_name: string;
      annual_cost: number;
    }>;
    annual_savings: number;
    features_covered: string[];
    features_at_risk: string[];
    migration_effort: string;
    business_risk: string;
    recommendation_text: string;
    confidence_score: number;
  }>;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function ConsolidationCards({ recommendations, onAccept, onReject }: ConsolidationCardsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No consolidation opportunities found</p>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {recommendations.map(rec => (
        <div
          key={rec.id}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold text-white">
                  {rec.software_to_keep.software_name}
                </h3>
              </div>
              <p className="text-sm text-gray-400">
                by {rec.software_to_keep.vendor_name}
              </p>
              <p className="text-xs text-green-400 mt-1">✓ Recommended to keep</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-400">
                ${(rec.annual_savings / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-gray-400">annual savings</div>
            </div>
          </div>

          {/* Software to remove */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              Can replace:
            </h4>
            <div className="flex flex-wrap gap-2">
              {rec.software_to_remove.map((sw, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-sm"
                >
                  {sw.software_name}
                </span>
              ))}
            </div>
          </div>

          {/* Features covered */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">
              Features covered: {rec.features_covered.length}
            </h4>
            <div className="flex flex-wrap gap-2">
              {rec.features_covered.slice(0, expandedId === rec.id ? undefined : 5).map((feature, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-green-900/20 text-green-400 rounded text-xs"
                >
                  {feature}
                </span>
              ))}
              {rec.features_covered.length > 5 && expandedId !== rec.id && (
                <button
                  onClick={() => setExpandedId(rec.id)}
                  className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600"
                >
                  +{rec.features_covered.length - 5} more
                </button>
              )}
            </div>
          </div>

          {/* Risk indicators */}
          <div className="grid grid-cols-3 gap-4 text-sm mb-4 p-3 bg-gray-900/50 rounded-lg">
            <div>
              <span className="text-gray-400 block text-xs">Migration Effort</span>
              <span className={`font-semibold ${getRiskColor(rec.migration_effort)}`}>
                {rec.migration_effort.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Business Risk</span>
              <span className={`font-semibold ${getRiskColor(rec.business_risk)}`}>
                {rec.business_risk.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Confidence</span>
              <span className="font-semibold text-blue-400">
                {(rec.confidence_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* AI recommendation */}
          <div className="text-sm text-gray-300 bg-gray-900/50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p>{rec.recommendation_text}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => onAccept?.(rec.id)}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-semibold transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors"
            >
              Details
            </button>
            <button
              onClick={() => onReject?.(rec.id)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
