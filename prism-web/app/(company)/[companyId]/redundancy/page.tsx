'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { OverlapMatrix } from '@/components/redundancy/OverlapMatrix';
import { ConsolidationCards } from '@/components/redundancy/ConsolidationCards';
import { RefreshCw, TrendingDown, Layers, Target, DollarSign } from 'lucide-react';

interface AnalysisData {
  overlaps: any[];
  comparisonMatrix: any[];
  recommendations: any[];
  totalRedundancyCost: number;
  analysisDate: Date;
}

export default function RedundancyPage() {
  const params = useParams();
  const companyId = params.companyId as string;

  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/redundancy/analyze?companyId=${companyId}`);
      const result = await res.json();

      if (result.success) {
        setAnalysis(result.data);
      }
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      const res = await fetch('/api/redundancy/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });

      const result = await res.json();

      if (result.success) {
        setAnalysis(result.data);
      }
    } catch (error) {
      console.error('Failed to run analysis:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAcceptRecommendation = async (id: string) => {
    try {
      await fetch('/api/redundancy/recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId: id, status: 'accepted' }),
      });

      loadAnalysis();
    } catch (error) {
      console.error('Failed to accept recommendation:', error);
    }
  };

  const handleRejectRecommendation = async (id: string) => {
    try {
      await fetch('/api/redundancy/recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId: id, status: 'rejected' }),
      });

      loadAnalysis();
    } catch (error) {
      console.error('Failed to reject recommendation:', error);
    }
  };

  const calculatePotentialSavings = () => {
    if (!analysis) return 0;
    return analysis.recommendations.reduce((sum, r) => sum + r.annual_savings, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading redundancy analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Redundancy Analysis</h1>
          <p className="text-gray-400 mt-2">
            Identify overlapping features and consolidation opportunities
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white font-semibold transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Analyzing...' : 'Re-analyze Portfolio'}
        </button>
      </div>

      {analysis && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Redundancy Cost */}
            <div className="bg-gradient-to-br from-red-900/20 to-red-950/20 border border-red-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-red-400" />
                <div className="text-xs text-red-400 font-semibold">WASTED</div>
              </div>
              <div className="text-3xl font-bold text-white">
                ${(analysis.totalRedundancyCost / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-gray-400 mt-1">Spent on duplicate features</div>
            </div>

            {/* Overlapping Features */}
            <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-950/20 border border-yellow-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Layers className="w-8 h-8 text-yellow-400" />
                <div className="text-xs text-yellow-400 font-semibold">OVERLAPS</div>
              </div>
              <div className="text-3xl font-bold text-white">{analysis.overlaps.length}</div>
              <div className="text-sm text-gray-400 mt-1">Feature categories with overlap</div>
            </div>

            {/* Consolidation Opportunities */}
            <div className="bg-gradient-to-br from-green-900/20 to-green-950/20 border border-green-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-green-400" />
                <div className="text-xs text-green-400 font-semibold">OPPORTUNITIES</div>
              </div>
              <div className="text-3xl font-bold text-white">
                {analysis.recommendations.length}
              </div>
              <div className="text-sm text-gray-400 mt-1">AI-identified quick wins</div>
            </div>

            {/* Potential Savings */}
            <div className="bg-gradient-to-br from-blue-900/20 to-blue-950/20 border border-blue-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown className="w-8 h-8 text-blue-400" />
                <div className="text-xs text-blue-400 font-semibold">POTENTIAL</div>
              </div>
              <div className="text-3xl font-bold text-white">
                ${(calculatePotentialSavings() / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-gray-400 mt-1">From consolidation</div>
            </div>
          </div>

          {/* Overlap Matrix */}
          {analysis.comparisonMatrix.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Feature Overlap Matrix</h2>
              <p className="text-sm text-gray-400 mb-6">
                Heatmap showing feature overlap between software products. Darker colors indicate
                higher redundancy.
              </p>
              <OverlapMatrix data={analysis.comparisonMatrix} />
            </div>
          )}

          {/* Consolidation Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Consolidation Opportunities ({analysis.recommendations.length})
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                AI-generated recommendations to eliminate redundancy and reduce costs.
              </p>
              <ConsolidationCards
                recommendations={analysis.recommendations}
                onAccept={handleAcceptRecommendation}
                onReject={handleRejectRecommendation}
              />
            </div>
          )}

          {/* Category Overlaps Summary */}
          {analysis.overlaps.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Overlap by Category</h2>
              <div className="space-y-3">
                {analysis.overlaps.slice(0, 10).map((overlap, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{overlap.category}</h3>
                      <p className="text-sm text-gray-400">
                        {overlap.overlapCount} software products have this category
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-400">
                        ${(overlap.redundancyCost / 1000).toFixed(0)}K
                      </div>
                      <div className="text-xs text-gray-400">redundancy cost</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!analysis && !loading && (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">No analysis data available</p>
          <button
            onClick={runAnalysis}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold"
          >
            Run Analysis
          </button>
        </div>
      )}
    </div>
  );
}
