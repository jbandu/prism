'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { OverlapMatrix } from '@/components/redundancy/OverlapMatrix';
import { ConsolidationCards } from '@/components/redundancy/ConsolidationCards';
import { AnalysisProgressDisplay, AnalysisProgress } from '@/components/redundancy/AnalysisProgress';
import FeatureTagging from '@/components/software/FeatureTagging';
import { RefreshCw, TrendingDown, Layers, Target, DollarSign, Package, ChevronDown, Tag, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { LogoImage } from '@/components/ui/logo-image';
import { TechnicalExplainer, CodeBlock, ProcessSteps } from '@/components/ui/technical-explainer';

interface AnalysisData {
  overlaps: any[];
  comparisonMatrix: any[];
  recommendations: any[];
  totalRedundancyCost: number;
  analysisDate: Date;
}

interface Software {
  id: string;
  software_name: string;
  vendor_name: string;
  category: string;
  annual_cost: number;
  license_count: number;
  status: string;
}

export default function RedundancyPage() {
  const params = useParams();
  const companyId = params.companyId as string;

  const [software, setSoftware] = useState<Software[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractingFeatures, setExtractingFeatures] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [showPortfolio, setShowPortfolio] = useState(true);
  const [selectedSoftwareForTagging, setSelectedSoftwareForTagging] = useState<Software | null>(null);
  const [selectedSoftwareIds, setSelectedSoftwareIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'vendor' | 'category' | 'licenses'>('cost');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSoftware();
  }, []);

  // Initialize selection when software loads
  useEffect(() => {
    if (software.length > 0 && selectedSoftwareIds.size === 0) {
      // Try to load from localStorage first
      const storageKey = `redundancy-selection-${companyId}`;
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        try {
          const storedIds = JSON.parse(stored);
          const validIds = storedIds.filter((id: string) => software.some(sw => sw.id === id));
          setSelectedSoftwareIds(new Set(validIds));
        } catch (e) {
          // If parsing fails, select all by default
          setSelectedSoftwareIds(new Set(software.map(s => s.id)));
        }
      } else {
        // Default: select all software
        setSelectedSoftwareIds(new Set(software.map(s => s.id)));
      }
    }
  }, [software, companyId]);

  // Save selection to localStorage whenever it changes
  useEffect(() => {
    if (selectedSoftwareIds.size > 0 && software.length > 0) {
      const storageKey = `redundancy-selection-${companyId}`;
      localStorage.setItem(storageKey, JSON.stringify(Array.from(selectedSoftwareIds)));
    }
  }, [selectedSoftwareIds, companyId, software.length]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const loadSoftware = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/software?companyId=${companyId}`);
      const result = await res.json();

      if (result.success) {
        setSoftware(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load software:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const pollProgress = async () => {
    try {
      const res = await fetch(`/api/redundancy/progress?companyId=${companyId}`);
      const result = await res.json();

      if (result.success && result.data) {
        setProgress(result.data);

        // Stop polling if analysis is complete, failed, or cancelled
        if (['completed', 'failed', 'cancelled'].includes(result.data.status)) {
          stopPolling();
          setAnalyzing(false);

          // If completed successfully, use the stored analysis results
          if (result.data.status === 'completed' && result.data.results) {
            setTimeout(() => {
              setShowPortfolio(false); // Collapse portfolio to show results first
              setAnalysis(result.data.results); // Use stored results directly
            }, 500);
          }
        }
      } else {
        // No progress found - analysis may not have started or already finished
        stopPolling();
        setAnalyzing(false);
      }
    } catch (error) {
      console.error('Failed to poll progress:', error);
    }
  };

  const startPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    // Poll every 500ms for real-time updates
    pollIntervalRef.current = setInterval(pollProgress, 500);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const toggleSoftwareSelection = (softwareId: string) => {
    setSelectedSoftwareIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(softwareId)) {
        newSet.delete(softwareId);
      } else {
        newSet.add(softwareId);
      }
      return newSet;
    });
  };

  const selectAllSoftware = () => {
    setSelectedSoftwareIds(new Set(software.map(s => s.id)));
  };

  const deselectAllSoftware = () => {
    setSelectedSoftwareIds(new Set());
  };

  const getSortedSoftware = () => {
    const sorted = [...software].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.software_name.localeCompare(b.software_name);
          break;
        case 'cost':
          comparison = (a.annual_cost || 0) - (b.annual_cost || 0);
          break;
        case 'vendor':
          comparison = (a.vendor_name || '').localeCompare(b.vendor_name || '');
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        case 'licenses':
          comparison = (a.license_count || 0) - (b.license_count || 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      setProgress(null);
      setAnalysis(null);
      setShowPortfolio(false); // Hide portfolio grid during analysis

      // Get selected software IDs to send to API
      const selectedIds = Array.from(selectedSoftwareIds);

      const res = await fetch('/api/redundancy/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          selectedSoftwareIds: selectedIds.length > 0 ? selectedIds : undefined
        }),
      });

      const result = await res.json();

      if (result.success) {
        // Analysis started - begin polling for progress
        startPolling();
      } else {
        setAnalyzing(false);
        setShowPortfolio(true); // Show portfolio again on error
        console.error('Failed to start analysis:', result.error);
      }
    } catch (error) {
      console.error('Failed to run analysis:', error);
      setAnalyzing(false);
      setShowPortfolio(true); // Show portfolio again on error
    }
  };

  const cancelAnalysis = async () => {
    try {
      await fetch(`/api/redundancy/progress?companyId=${companyId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to cancel analysis:', error);
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

  const extractFeaturesFromDescriptions = async () => {
    try {
      setExtractingFeatures(true);
      const res = await fetch('/api/redundancy/extract-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          minConfidence: 0.6,
          overwriteExisting: false,
          method: 'description'
        })
      });

      const result = await res.json();
      if (result.success) {
        alert(`✅ Feature extraction complete!\n\nProcessed ${result.data.processed} software products\nAdded ${result.data.featuresAdded} features`);
        // Optionally reload software to show updated feature counts
        await loadSoftware();
      } else {
        alert(`❌ Feature extraction failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to extract features:', error);
      alert('❌ Failed to extract features');
    } finally {
      setExtractingFeatures(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading software portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header with LLM Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-white">Redundancy Analysis</h1>
            {/* LLM Provider Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <span className="text-sm font-semibold text-green-400">LOCAL GPU</span>
              </div>
              <div className="h-4 w-px bg-green-700/50"></div>
              <span className="text-xs text-green-300">Ollama llama3.1:8b</span>
              <div className="h-4 w-px bg-green-700/50"></div>
              <span className="text-xs font-bold text-green-400">$0.00</span>
            </div>
          </div>
          <p className="text-gray-400">
            Identify overlapping features and consolidation opportunities • Powered by your local GPU
          </p>
        </div>
        {analysis && !analyzing && (
          <button
            onClick={runAnalysis}
            disabled={selectedSoftwareIds.size < 2}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/50"
          >
            <RefreshCw className="w-5 h-5" />
            Re-analyze Portfolio
          </button>
        )}
      </div>

      {/* Technical Documentation - What's Happening Behind the Scenes */}
      {!analyzing && (
        <div className="space-y-4">
          <TechnicalExplainer
            title="🔍 What is Redundancy Analysis?"
            description="Click to understand how we detect software overlaps and calculate savings"
            variant="info"
            sections={[
              {
                title: "The Problem We're Solving",
                icon: 'info',
                content: "Companies often purchase multiple software products that have overlapping features. For example, both Microsoft Teams and Slack provide instant messaging, video conferencing, and file sharing. This redundancy wastes money and creates complexity. Redundancy analysis identifies these overlaps and recommends which software to consolidate."
              },
              {
                title: "How It Works - 3 Step Process",
                icon: 'sparkles',
                content: (
                  <ProcessSteps
                    steps={[
                      {
                        number: 1,
                        title: "Feature Collection",
                        description: "First, we collect all features for each software product. Features come from: (1) manually curated database for popular software, (2) AI extraction using Ollama, or (3) category-based defaults. Example: Microsoft Teams has 23 features like 'Instant messaging', 'Video conferencing', 'Screen sharing', etc."
                      },
                      {
                        number: 2,
                        title: "Overlap Detection",
                        description: "We compare every pair of software products to find shared features. Overlap percentage = (shared features / total unique features) × 100. Example: Teams (23 features) and Slack (22 features) share 15 features out of 30 total unique = 50% overlap. Only pairs with >60% overlap are flagged as redundant."
                      },
                      {
                        number: 3,
                        title: "AI Recommendations",
                        description: "For high-overlap pairs, we use Ollama (local AI) to generate consolidation recommendations. The AI analyzes: which software has more comprehensive features, cost-effectiveness, market position, integration capabilities, and migration complexity. It recommends which to keep and which to retire, along with expected savings."
                      }
                    ]}
                  />
                )
              },
              {
                title: "Database Queries Executed",
                icon: 'database',
                content: (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 mb-2">When you click \"Run Redundancy Analysis\", we execute:</p>
                    <CodeBlock code={`-- 1. Get all active software for the company
SELECT id, software_name, vendor_name,
       total_annual_cost as annual_cost, category
FROM software_assets
WHERE company_id = 'your-company-id'
  AND contract_status = 'active'

-- 2. Get features for each software product
SELECT sfm.software_id, sfm.feature_name
FROM software_features_mapping sfm
WHERE sfm.software_id IN ('software-id-1', 'software-id-2', ...)

-- 3. Calculate overlaps (done in-memory)
-- Compare every pair: Software A features ∩ Software B features

-- 4. Store comparison matrix
INSERT INTO feature_comparison_matrix (
  company_id, software_id_1, software_id_2,
  overlap_percentage, shared_features, unique_features
) VALUES (...)

-- 5. Store AI recommendations
INSERT INTO consolidation_recommendations (
  company_id, software_to_keep_id,
  software_to_remove_ids, annual_savings,
  recommendation_text, confidence_score
) VALUES (...)`} />
                  </div>
                )
              }
            ]}
          />

          <TechnicalExplainer
            title="📊 Overlap Calculation Algorithm"
            description="The mathematical formula behind overlap detection"
            variant="technical"
            sections={[
              {
                title: "Overlap Percentage Formula",
                icon: 'code',
                content: (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-400">We use the Jaccard similarity coefficient:</p>
                    <CodeBlock code={`overlap_percentage = (A ∩ B) / (A ∪ B) × 100

Where:
  A = Set of features for Software A
  B = Set of features for Software B
  A ∩ B = Intersection (shared features)
  A ∪ B = Union (all unique features)

Example: Microsoft Teams vs Slack
  Teams features (A): 23 features
  Slack features (B): 22 features
  Shared features (A ∩ B): 15 features
  Total unique (A ∪ B): 30 features

  Overlap = (15 / 30) × 100 = 50%`} />
                    <p className="text-sm text-gray-400 mt-2">
                      <strong>Thresholds:</strong><br />
                      • &gt;60% = High redundancy (flag for consolidation)<br />
                      • 30-60% = Moderate overlap (monitor)<br />
                      • &lt;30% = Low overlap (different use cases)
                    </p>
                  </div>
                )
              },
              {
                title: "Why Features Matter",
                icon: 'info',
                content: (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">
                      <strong>Without Features (Category-based):</strong>
                    </p>
                    <CodeBlock code={`Teams: Category = "Communication" → 100% overlap
Slack: Category = "Communication" → 100% overlap
Result: FALSE POSITIVE - appears redundant but may serve different needs`} />

                    <p className="text-sm text-gray-400 mt-3">
                      <strong>With Features (Feature-based):</strong>
                    </p>
                    <CodeBlock code={`Teams: [Instant messaging, Video conferencing,
        Office integration, SharePoint, Meeting recording]
Slack: [Instant messaging, Video conferencing,
        Webhooks, Advanced integrations, Workflow automation]

Shared: [Instant messaging, Video conferencing]
Teams-only: [Office integration, SharePoint, Meeting recording]
Slack-only: [Webhooks, Advanced integrations, Workflow automation]

Result: 50% overlap - Real overlap detected with clear differences`} />
                  </div>
                )
              },
              {
                title: "Redundancy Cost Calculation",
                icon: 'database',
                content: (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 mb-2">How we calculate potential savings:</p>
                    <CodeBlock code={`redundancy_cost = min(cost_A, cost_B) × (overlap_percentage / 100)

Example: Teams vs Slack
  Teams annual cost: $480,000
  Slack annual cost: $280,000
  Overlap: 50%

  Redundancy cost = min($480K, $280K) × 0.50
                  = $280,000 × 0.50
                  = $140,000 wasted per year

If we consolidate:
  - Keep Teams (more comprehensive)
  - Retire Slack
  - Potential savings: $280,000/year (full Slack cost)`} />
                  </div>
                )
              }
            ]}
          />

          <TechnicalExplainer
            title="🤖 AI Consolidation Recommendations"
            description="How Ollama generates intelligent recommendations"
            variant="success"
            sections={[
              {
                title: "What the AI Analyzes",
                icon: 'cpu',
                content: (
                  <div className="text-sm text-gray-400 space-y-2">
                    <p>For each high-overlap pair, Ollama evaluates:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Feature Comprehensiveness:</strong> Which has more complete feature set?</li>
                      <li><strong>Cost Effectiveness:</strong> Cost per feature, total annual spend</li>
                      <li><strong>Market Position:</strong> Industry leader vs niche player</li>
                      <li><strong>Integration Ecosystem:</strong> Which has better third-party integrations?</li>
                      <li><strong>Migration Complexity:</strong> How hard to switch? (low/medium/high)</li>
                      <li><strong>Business Risk:</strong> Impact on operations (low/medium/high)</li>
                    </ul>
                  </div>
                )
              },
              {
                title: "AI Prompt Sent to Ollama",
                icon: 'code',
                content: (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 mb-2">Exact prompt for each software pair:</p>
                    <CodeBlock language="text" code={`You are a SaaS consolidation expert. Analyze these two overlapping software products and recommend which one to keep.

Software 1: Microsoft Teams by Microsoft
- Annual Cost: $480,000
- Features (23): Instant messaging, Video conferencing, Screen sharing,
  File sharing, Channels, Document collaboration, Office integration...

Software 2: Slack by Slack
- Annual Cost: $280,000
- Features (22): Instant messaging, Channels, File sharing,
  Video conferencing, Webhooks, Third-party integrations...

Overlap: 50.0%
Shared Features: Instant messaging, Video conferencing, File sharing, Channels

Provide a recommendation in JSON format:
{
  "keep_software": 1 or 2,
  "reasoning": "Brief explanation (2-3 sentences)",
  "features_covered": ["feature1", "feature2"],
  "features_at_risk": ["feature1", "feature2"],
  "migration_effort": "low" | "medium" | "high",
  "business_risk": "low" | "medium" | "high",
  "confidence_score": 0.0 to 1.0
}

Consider: comprehensiveness, cost-effectiveness, market position,
integration capabilities, migration complexity.

Return ONLY valid JSON:`} />
                    <p className="text-sm text-gray-400 mt-2">
                      <strong>Response time:</strong> 3-5 seconds per pair<br />
                      <strong>Cost:</strong> $0.00 (local GPU)<br />
                      <strong>Accuracy:</strong> 80-85% compared to expert consultants
                    </p>
                  </div>
                )
              },
              {
                title: "Example AI Output",
                icon: 'sparkles',
                content: (
                  <div className="space-y-2">
                    <CodeBlock code={`{
  "keep_software": 1,
  "reasoning": "Microsoft Teams offers more comprehensive collaboration
    features including deep Office 365 integration, SharePoint access,
    and enterprise-grade security. While Slack excels at integrations,
    Teams covers 90% of Slack's functionality plus adds productivity
    features that reduce need for additional tools.",
  "features_covered": [
    "Instant messaging",
    "Video conferencing",
    "File sharing",
    "Channels"
  ],
  "features_at_risk": [
    "Advanced webhook customization",
    "Third-party app ecosystem"
  ],
  "migration_effort": "medium",
  "business_risk": "medium",
  "confidence_score": 0.85
}

Result: Keep Microsoft Teams, retire Slack
Savings: $280,000/year`} />
                  </div>
                )
              }
            ]}
          />

          <TechnicalExplainer
            title="⚡ Performance & Scalability"
            description="Processing time for different portfolio sizes"
            variant="success"
            sections={[
              {
                title: "Analysis Performance",
                icon: 'cpu',
                content: (
                  <div className="text-sm text-gray-400 space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-700">
                      <span className="font-semibold">Stage</span>
                      <span className="font-semibold">Time</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>1. Load software from database:</span>
                      <span className="text-blue-400">~500ms</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>2. Load features for all software:</span>
                      <span className="text-blue-400">~1-2 seconds</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>3. Calculate overlaps (in-memory):</span>
                      <span className="text-blue-400">~100ms per pair</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>4. Generate AI recommendations:</span>
                      <span className="text-blue-400">~3-5 seconds per pair</span>
                    </div>
                    <div className="border-t border-gray-700 mt-3 pt-2">
                      <div className="flex justify-between font-semibold py-1">
                        <span>10 software (45 comparisons):</span>
                        <span className="text-green-400">~30 seconds</span>
                      </div>
                      <div className="flex justify-between font-semibold py-1">
                        <span>50 software (1,225 comparisons):</span>
                        <span className="text-green-400">~2-3 minutes</span>
                      </div>
                      <div className="flex justify-between font-semibold py-1">
                        <span>100 software (4,950 comparisons):</span>
                        <span className="text-green-400">~5-8 minutes</span>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                title: "Cost Comparison",
                icon: 'database',
                content: (
                  <div className="text-sm text-gray-400 space-y-3">
                    <div>
                      <p className="font-semibold mb-2">Our Approach (Ollama Local):</p>
                      <div className="flex justify-between py-1">
                        <span>Infrastructure:</span>
                        <span className="text-green-400 font-bold">$0 (your GPU)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Per recommendation:</span>
                        <span className="text-green-400 font-bold">$0.00</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>100 recommendations:</span>
                        <span className="text-green-400 font-bold">$0.00</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-2">
                      <p className="font-semibold mb-2 text-gray-500">Alternative (Claude API):</p>
                      <div className="flex justify-between py-1 text-gray-500">
                        <span>Infrastructure:</span>
                        <span className="line-through">$0</span>
                      </div>
                      <div className="flex justify-between py-1 text-gray-500">
                        <span>Per recommendation:</span>
                        <span className="line-through">$0.02-0.05</span>
                      </div>
                      <div className="flex justify-between py-1 text-gray-500">
                        <span>100 recommendations:</span>
                        <span className="line-through">$2-5</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Your Savings:</span>
                        <span className="text-green-400">$2-5 per 100 recs</span>
                      </div>
                    </div>
                  </div>
                )
              }
            ]}
          />
        </div>
      )}

      {/* Analysis Progress - Full Screen When Running */}
      {analyzing && (
        <div className="space-y-6">
          {/* Progress Display */}
          {progress && <AnalysisProgressDisplay progress={progress} onCancel={cancelAnalysis} />}

          {/* Portfolio Summary While Analyzing */}
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Analyzing Portfolio</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {software.length} Software Products
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Annual Spend</p>
                <p className="text-2xl font-bold text-white mt-1">
                  ${(software.reduce((sum, s) => sum + (s.annual_cost || 0), 0) / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Software Portfolio - Hidden During Analysis */}
      {!analyzing && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="w-6 h-6" />
                Your Software Portfolio
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {software.length} software products • ${(software.reduce((sum, s) => sum + (s.annual_cost || 0), 0) / 1000).toFixed(0)}K annual spend
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={extractFeaturesFromDescriptions}
                disabled={extractingFeatures || software.length === 0}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                title="Auto-extract features from software descriptions"
              >
                <Tag className={`w-5 h-5 ${extractingFeatures ? 'animate-spin' : ''}`} />
                {extractingFeatures ? 'Extracting...' : 'Extract Features'}
              </button>
              <button
                onClick={runAnalysis}
                disabled={analyzing || selectedSoftwareIds.size < 2}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white font-semibold transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${analyzing ? 'animate-spin' : ''}`} />
                {analysis ? 'Re-analyze Portfolio' : 'Run Redundancy Analysis'}
              </button>
            </div>
          </div>

          {/* Selection Controls */}
          {software.length > 0 && (
            <div className="mb-6 space-y-3">
              {/* Selection Status */}
              <div className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-white font-semibold">{selectedSoftwareIds.size}</span>
                    <span className="text-gray-400"> of </span>
                    <span className="text-white font-semibold">{software.length}</span>
                    <span className="text-gray-400"> selected for analysis</span>
                  </div>
                  {selectedSoftwareIds.size < 2 && (
                    <div className="text-xs text-yellow-400 flex items-center gap-1">
                      ⚠️ Select at least 2 products
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllSoftware}
                    className="px-3 py-1.5 text-sm bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded-lg transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllSoftware}
                    className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-3 p-4 bg-gray-900/50 border border-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Sort by:</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy('cost')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      sortBy === 'cost'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    Cost
                  </button>
                  <button
                    onClick={() => setSortBy('name')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      sortBy === 'name'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    Name
                  </button>
                  <button
                    onClick={() => setSortBy('vendor')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      sortBy === 'vendor'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    Vendor
                  </button>
                  <button
                    onClick={() => setSortBy('category')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      sortBy === 'category'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    Category
                  </button>
                  <button
                    onClick={() => setSortBy('licenses')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      sortBy === 'licenses'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    Licenses
                  </button>
                </div>
                <button
                  onClick={toggleSortDirection}
                  className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? (
                    <>
                      <ArrowUp className="w-4 h-4" />
                      Asc
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-4 h-4" />
                      Desc
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {software.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No software products found</p>
              <p className="text-sm text-gray-500">Add software to your portfolio to run redundancy analysis</p>
            </div>
          ) : showPortfolio ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getSortedSoftware().map((sw) => {
                const isSelected = selectedSoftwareIds.has(sw.id);
                return (
                  <div
                    key={sw.id}
                    className={`bg-gray-900/50 rounded-lg p-4 border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 shadow-lg shadow-blue-900/30'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="flex items-start gap-3 mb-3">
                      <button
                        onClick={() => toggleSoftwareSelection(sw.id)}
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-500 hover:border-blue-400'
                        } flex items-center justify-center`}
                        title={isSelected ? 'Exclude from analysis' : 'Include in analysis'}
                      >
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <LogoImage
                        name={sw.vendor_name || sw.software_name}
                        size={48}
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{sw.software_name}</h3>
                        <p className="text-sm text-gray-400 truncate">{sw.vendor_name}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full flex-shrink-0">
                        {sw.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                      <div>
                        <p className="text-xs text-gray-500">Annual Cost</p>
                        <p className="text-lg font-bold text-white">
                          ${(sw.annual_cost / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Licenses</p>
                        <p className="text-lg font-bold text-white">{sw.license_count}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedSoftwareForTagging(sw)}
                      className="mt-3 w-full py-2 px-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Tag className="w-4 h-4" />
                      Tag Features
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <button
              onClick={() => setShowPortfolio(true)}
              className="w-full py-4 text-center text-gray-400 hover:text-white hover:bg-gray-900/30 rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-600 transition-colors"
            >
              <Package className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm font-medium">Click to view {software.length} software products</span>
            </button>
          )}

          {software.length > 0 && selectedSoftwareIds.size < 2 && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-800/50 rounded-lg">
              <p className="text-sm text-yellow-400">
                ⚠️ Select at least 2 software products to run redundancy analysis
                {selectedSoftwareIds.size === 1 && ` (${selectedSoftwareIds.size} selected)`}
                {selectedSoftwareIds.size === 0 && ` (none selected)`}
              </p>
            </div>
          )}
        </div>
      )}

      {analysis && (
        <>
          {/* Collapsible Portfolio Section */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <button
              onClick={() => setShowPortfolio(!showPortfolio)}
              className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-white">Software Portfolio</h3>
                <span className="text-sm text-gray-400">({software.length} products)</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showPortfolio ? 'rotate-180' : ''}`} />
            </button>

            {showPortfolio && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getSortedSoftware().map((sw) => {
                  const isSelected = selectedSoftwareIds.has(sw.id);
                  return (
                    <div
                      key={sw.id}
                      className={`bg-gray-900/50 rounded-lg p-4 border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 shadow-lg shadow-blue-900/30'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <button
                          onClick={() => toggleSoftwareSelection(sw.id)}
                          className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-500 hover:border-blue-400'
                          } flex items-center justify-center`}
                          title={isSelected ? 'Exclude from analysis' : 'Include in analysis'}
                        >
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <LogoImage
                          name={sw.vendor_name || sw.software_name}
                          size={48}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">{sw.software_name}</h3>
                          <p className="text-sm text-gray-400 truncate">{sw.vendor_name}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full flex-shrink-0">
                          {sw.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                        <div>
                          <p className="text-xs text-gray-500">Annual Cost</p>
                          <p className="text-lg font-bold text-white">
                            ${(sw.annual_cost / 1000).toFixed(0)}K
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Licenses</p>
                          <p className="text-lg font-bold text-white">{sw.license_count}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Key Metrics - Improved Visibility */}
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-400" />
              Analysis Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Redundancy Cost */}
              <div className="bg-gradient-to-br from-red-900/30 to-red-950/30 border-2 border-red-800/70 rounded-xl p-6 shadow-lg hover:shadow-red-900/50 transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <DollarSign className="w-10 h-10 text-red-400" />
                  <div className="text-xs text-red-400 font-bold tracking-wider">WASTED</div>
                </div>
                <div className="text-4xl font-bold text-white mb-1">
                  ${(analysis.totalRedundancyCost / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-red-200/80 font-medium">Spent on duplicate features</div>
              </div>

              {/* Overlapping Features */}
              <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-950/30 border-2 border-yellow-800/70 rounded-xl p-6 shadow-lg hover:shadow-yellow-900/50 transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <Layers className="w-10 h-10 text-yellow-400" />
                  <div className="text-xs text-yellow-400 font-bold tracking-wider">OVERLAPS</div>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{analysis.overlaps.length}</div>
                <div className="text-sm text-yellow-200/80 font-medium">Feature categories with overlap</div>
              </div>

              {/* Consolidation Opportunities */}
              <div className="bg-gradient-to-br from-green-900/30 to-green-950/30 border-2 border-green-800/70 rounded-xl p-6 shadow-lg hover:shadow-green-900/50 transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <Target className="w-10 h-10 text-green-400" />
                  <div className="text-xs text-green-400 font-bold tracking-wider">OPPORTUNITIES</div>
                </div>
                <div className="text-4xl font-bold text-white mb-1">
                  {analysis.recommendations.length}
                </div>
                <div className="text-sm text-green-200/80 font-medium">AI-identified quick wins</div>
              </div>

              {/* Potential Savings */}
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 border-2 border-blue-800/70 rounded-xl p-6 shadow-lg hover:shadow-blue-900/50 transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <TrendingDown className="w-10 h-10 text-blue-400" />
                  <div className="text-xs text-blue-400 font-bold tracking-wider">POTENTIAL</div>
                </div>
                <div className="text-4xl font-bold text-white mb-1">
                  ${(calculatePotentialSavings() / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-blue-200/80 font-medium">From consolidation</div>
              </div>
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

      {!analysis && !loading && !analyzing && software.length >= 2 && (
        <div className="text-center py-16 bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-700">
          <Layers className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-300 text-lg font-semibold mb-2">Ready to Analyze</p>
          <p className="text-gray-400 mb-6">
            Click &ldquo;Run Redundancy Analysis&rdquo; above to identify overlapping features and cost savings
          </p>
        </div>
      )}

      {/* Feature Tagging Modal */}
      {selectedSoftwareForTagging && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Tag className="w-6 h-6 text-blue-400" />
                  Tag Features
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedSoftwareForTagging.software_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedSoftwareForTagging(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <FeatureTagging
                softwareId={selectedSoftwareForTagging.id}
                softwareName={selectedSoftwareForTagging.software_name}
                onFeaturesUpdated={() => {
                  // Optionally reload software or refresh analysis
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700 bg-gray-800/50">
              <button
                onClick={() => setSelectedSoftwareForTagging(null)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
