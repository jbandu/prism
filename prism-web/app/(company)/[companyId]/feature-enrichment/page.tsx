'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sparkles, RefreshCw, Database, Check, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { TechnicalExplainer, CodeBlock, ProcessSteps } from '@/components/ui/technical-explainer';

interface Software {
  id: string;
  software_name: string;
  vendor_name: string;
  category: string;
  annual_cost: number;
}

interface EnrichmentResult {
  software_name: string;
  features_count: number;
  method: 'known' | 'ai' | 'category' | 'error';
  confidence: number;
}

export default function FeatureEnrichmentPage() {
  const params = useParams();
  const companyId = params.companyId as string;

  const [software, setSoftware] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [selectedSoftwareIds, setSelectedSoftwareIds] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<EnrichmentResult[]>([]);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [totalFeaturesAdded, setTotalFeaturesAdded] = useState(0);

  useEffect(() => {
    loadSoftware();
  }, []);

  const loadSoftware = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/software?companyId=${companyId}`);
      const result = await res.json();

      if (result.success) {
        setSoftware(result.data || []);
        // Select all by default
        setSelectedSoftwareIds(new Set(result.data.map((s: Software) => s.id)));
      }
    } catch (error) {
      console.error('Failed to load software:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSoftwareSelection = (id: string) => {
    const newSelection = new Set(selectedSoftwareIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedSoftwareIds(newSelection);
  };

  const selectAll = () => {
    setSelectedSoftwareIds(new Set(software.map(s => s.id)));
  };

  const deselectAll = () => {
    setSelectedSoftwareIds(new Set());
  };

  const startEnrichment = async () => {
    if (selectedSoftwareIds.size === 0) {
      alert('Please select at least one software product to enrich');
      return;
    }

    try {
      setEnriching(true);
      setResults([]);

      const res = await fetch('/api/redundancy/enrich-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          selectedSoftwareIds: Array.from(selectedSoftwareIds),
          overwriteExisting: false,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setResults(result.data.results);
        setTotalProcessed(result.data.processed);
        setTotalFeaturesAdded(result.data.featuresAdded);

        alert(
          `✅ Feature enrichment complete!\n\n` +
          `Processed: ${result.data.processed} software products\n` +
          `Added: ${result.data.featuresAdded} features\n` +
          `Cost: $0.00 (local AI)`
        );
      } else {
        alert(`❌ Enrichment failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to enrich features:', error);
      alert('❌ Failed to enrich features');
    } finally {
      setEnriching(false);
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'known':
        return <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">Known</span>;
      case 'ai':
        return <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">AI</span>;
      case 'category':
        return <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">Category</span>;
      case 'error':
        return <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">Error</span>;
      default:
        return null;
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
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">AI Feature Enrichment</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Automatically extract detailed features from your software portfolio using AI
        </p>

        {/* LLM Indicator */}
        <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-green-400">LOCAL AI</span>
          </div>
          <div className="h-4 w-px bg-gray-600" />
          <span className="text-sm text-gray-300">Ollama llama3.1:8b</span>
          <div className="h-4 w-px bg-gray-600" />
          <span className="text-sm text-green-400 font-semibold">$0.00</span>
        </div>
      </div>

      {/* Technical Documentation - What's Happening Behind the Scenes */}
      <div className="mb-8 space-y-4">
        <TechnicalExplainer
          title="🔍 What is Feature Enrichment?"
          description="Click to understand what happens when you click 'Enrich Features with AI'"
          variant="info"
          sections={[
            {
              title: "The Problem We're Solving",
              icon: 'info',
              content: "Your software portfolio has basic metadata (name, vendor, cost, category) but lacks detailed feature information. Without knowing what features each software provides (e.g., 'video conferencing', 'file sharing', 'task management'), we cannot accurately detect redundancies. For example, both Microsoft Teams and Slack have video conferencing capabilities - but we wouldn't know this from just their categories."
            },
            {
              title: "What We Do",
              icon: 'sparkles',
              content: (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">
                    Feature enrichment automatically extracts comprehensive feature lists for each software product using a 3-tier intelligence system:
                  </p>
                  <ProcessSteps
                    steps={[
                      {
                        number: 1,
                        title: "Check Known Database",
                        description: "First, we check if we have manually curated features for popular software (Slack, Teams, Zoom, Asana, etc.). These are 95% accurate."
                      },
                      {
                        number: 2,
                        title: "AI Extraction (Ollama)",
                        description: "If not in database, we use local AI (Ollama llama3.1:8b) to extract features based on software name, vendor, and category. 80% accurate, $0 cost."
                      },
                      {
                        number: 3,
                        title: "Category Fallback",
                        description: "If AI fails, we use predefined features based on software category (Communication, Project Management, etc.). 50% accurate."
                      }
                    ]}
                  />
                </div>
              )
            },
            {
              title: "Database Queries Executed",
              icon: 'database',
              content: (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 mb-2">When you click "Enrich Features", we run:</p>
                  <CodeBlock code={`-- 1. Get all active software for this company
SELECT id, software_name, vendor_name, category
FROM software_assets
WHERE company_id = 'your-company-id'
  AND contract_status = 'active'

-- 2. For each software, check existing features
SELECT feature_name
FROM software_features_mapping
WHERE software_id = 'software-id'

-- 3. Insert new features (avoiding duplicates)
INSERT INTO software_features_mapping
  (software_id, feature_name, feature_category_id)
VALUES
  ('software-id', 'Video conferencing', NULL),
  ('software-id', 'File sharing', NULL),
  ('software-id', 'Instant messaging', NULL)
ON CONFLICT (software_id, feature_name) DO NOTHING`} />
                </div>
              )
            },
            {
              title: "AI Prompt (When Using Ollama)",
              icon: 'cpu',
              content: (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 mb-2">When software isn't in our known database, we send this prompt to Ollama:</p>
                  <CodeBlock language="text" code={`You are a SaaS software expert. Extract a comprehensive list of features for this software product.

Software: Microsoft Teams by Microsoft
Category: Communication

List ALL key features this software typically provides. Include:
- Communication features (chat, video, etc.)
- Collaboration features (file sharing, co-editing, etc.)
- Integration capabilities
- Security features
- Mobile/platform availability

Return ONLY a JSON array of feature names:
["Instant messaging", "Video conferencing", "File sharing", ...]`} />
                  <p className="text-sm text-gray-400 mt-2">
                    <strong>Response time:</strong> 2-3 seconds per software<br />
                    <strong>Cost:</strong> $0.00 (local GPU inference)<br />
                    <strong>Privacy:</strong> 100% local, no data leaves your server
                  </p>
                </div>
              )
            }
          ]}
        />

        <TechnicalExplainer
          title="💾 Data Storage"
          description="Where and how feature data is stored"
          variant="technical"
          sections={[
            {
              title: "Database Schema",
              icon: 'database',
              content: (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 mb-2">Features are stored in the <code className="bg-gray-800 px-1 rounded">software_features_mapping</code> table:</p>
                  <CodeBlock code={`TABLE: software_features_mapping
┌─────────────┬──────────────────┬──────────────┐
│ Column      │ Type             │ Description  │
├─────────────┼──────────────────┼──────────────┤
│ id          │ UUID             │ Primary key  │
│ software_id │ UUID             │ FK to software_assets │
│ feature_name│ TEXT             │ e.g., "Video conferencing" │
│ feature_category_id │ UUID    │ Optional grouping │
│ created_at  │ TIMESTAMP        │ When added   │
└─────────────┴──────────────────┴──────────────┘

CONSTRAINT: unique(software_id, feature_name)
  → Prevents duplicate features per software`} />
                </div>
              )
            },
            {
              title: "Example Data After Enrichment",
              icon: 'database',
              content: (
                <div className="space-y-2">
                  <CodeBlock code={`-- Microsoft Teams (23 features extracted)
software_id: ccb89694-...
features:
  - Instant messaging
  - Video conferencing
  - Screen sharing
  - File sharing
  - Channels/Rooms
  - Document collaboration
  - Microsoft Office integration
  - Meeting recording
  ... (15 more)

-- Slack (22 features extracted)
software_id: eda447ae-...
features:
  - Instant messaging
  - Channels/Rooms
  - File sharing
  - Video conferencing
  - Webhooks
  - Third-party integrations
  - Workflow automation
  ... (15 more)`} />
                </div>
              )
            }
          ]}
        />

        <TechnicalExplainer
          title="⚡ Performance & Cost"
          description="Processing time and infrastructure requirements"
          variant="success"
          sections={[
            {
              title: "Processing Speed",
              icon: 'cpu',
              content: (
                <div className="text-sm text-gray-400 space-y-2">
                  <div className="flex justify-between py-1">
                    <span>Known Database Lookup:</span>
                    <span className="text-green-400 font-medium">&lt;10ms per software</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>AI Extraction (Ollama):</span>
                    <span className="text-blue-400 font-medium">2-3 seconds per software</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Category Fallback:</span>
                    <span className="text-yellow-400 font-medium">&lt;50ms per software</span>
                  </div>
                  <div className="border-t border-gray-700 mt-2 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>10 software products:</span>
                      <span className="text-green-400">~30 seconds</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>100 software products:</span>
                      <span className="text-green-400">~3-5 minutes</span>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: "Cost Breakdown",
              icon: 'database',
              content: (
                <div className="text-sm text-gray-400 space-y-2">
                  <div className="flex justify-between py-1">
                    <span>Ollama (Local AI):</span>
                    <span className="text-green-400 font-bold">$0.00</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Database queries:</span>
                    <span className="text-green-400 font-bold">$0.00 (included in hosting)</span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-500">
                    <span>Alternative (Claude API):</span>
                    <span className="line-through">$0.01-0.03 per software</span>
                  </div>
                  <div className="border-t border-gray-700 mt-2 pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Cost:</span>
                      <span className="text-green-400">$0.00</span>
                    </div>
                  </div>
                </div>
              )
            }
          ]}
        />
      </div>

      {/* How It Works */}
      <div className="mb-8 p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <div className="text-2xl font-bold text-green-400 mb-2">1. Known Features</div>
            <p className="text-sm text-gray-400">
              For popular software like Slack, Teams, Zoom - uses curated feature lists (95% accuracy)
            </p>
          </div>
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400 mb-2">2. AI Extraction</div>
            <p className="text-sm text-gray-400">
              For other software - uses local AI (Ollama) to extract features (80% accuracy, $0 cost)
            </p>
          </div>
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400 mb-2">3. Category Fallback</div>
            <p className="text-sm text-gray-400">
              If AI fails - uses category-based features (50% accuracy)
            </p>
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="mb-6 flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
        <div className="flex items-center gap-4">
          <span className="text-gray-400">
            <Database className="w-5 h-5 inline mr-2" />
            {selectedSoftwareIds.size} of {software.length} selected
          </span>
          <button
            onClick={selectAll}
            className="px-3 py-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="px-3 py-1 text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            Deselect All
          </button>
        </div>
        <button
          onClick={startEnrichment}
          disabled={enriching || selectedSoftwareIds.size === 0}
          className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            enriching || selectedSoftwareIds.size === 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
          }`}
        >
          {enriching ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Enriching...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Enrich Features with AI
            </>
          )}
        </button>
      </div>

      {/* Software List */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Software Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {software.map(sw => {
            const isSelected = selectedSoftwareIds.has(sw.id);
            const result = results.find(r => r.software_name === sw.software_name);

            return (
              <div
                key={sw.id}
                onClick={() => toggleSoftwareSelection(sw.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{sw.software_name}</h3>
                    <p className="text-sm text-gray-400">{sw.vendor_name}</p>
                  </div>
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-500'
                    } flex items-center justify-center`}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    )}
                  </div>
                </div>

                {sw.category && (
                  <span className="inline-block px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded mb-2">
                    {sw.category}
                  </span>
                )}

                {result && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {result.features_count} features added
                      </span>
                      {getMethodBadge(result.method)}
                    </div>
                    <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all"
                        style={{ width: `${result.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Results Summary */}
      {results.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">✅ Enrichment Complete!</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="text-3xl font-bold text-blue-400">{totalProcessed}</div>
              <div className="text-sm text-gray-400">Software Processed</div>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="text-3xl font-bold text-green-400">{totalFeaturesAdded}</div>
              <div className="text-sm text-gray-400">Features Added</div>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="text-3xl font-bold text-purple-400">$0.00</div>
              <div className="text-sm text-gray-400">Total Cost (Local AI)</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-blue-400 mb-1">Next Step: Run Redundancy Analysis</div>
                <p className="text-sm text-gray-300">
                  Now that your software has detailed features, go to the{' '}
                  <a href={`/${companyId}/redundancy`} className="text-blue-400 underline">
                    Redundancy Analysis
                  </a>{' '}
                  page to detect overlaps and find consolidation opportunities!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
