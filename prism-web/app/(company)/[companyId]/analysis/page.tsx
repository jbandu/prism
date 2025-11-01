"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Sparkles,
  DollarSign,
  GitCompare,
  Shield,
  Workflow,
  Play,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  Target,
  Award,
  ArrowRight,
  Code,
  Zap,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import type { Software } from "@/types";

type AnalysisType = "cost_optimization" | "alternative_discovery" | "vendor_intelligence" | "portfolio_analysis" | "workflow_builder";

interface AnalysisResult {
  type: AnalysisType;
  status: "pending" | "running" | "completed" | "failed";
  data?: any;
  error?: string;
  timestamp?: Date;
}

const ANALYSIS_TYPES = [
  {
    id: "cost_optimization" as AnalysisType,
    name: "Cost Optimization",
    description: "Identify license waste, tier optimization, and negotiation leverage",
    icon: DollarSign,
    color: "green",
    estimatedTime: "2-3 minutes",
    inputs: ["software_selection"],
  },
  {
    id: "alternative_discovery" as AnalysisType,
    name: "Alternative Discovery",
    description: "Find better, cheaper alternatives with feature comparison",
    icon: GitCompare,
    color: "purple",
    estimatedTime: "3-5 minutes",
    inputs: ["software_selection", "requirements"],
  },
  {
    id: "vendor_intelligence" as AnalysisType,
    name: "Vendor Intelligence",
    description: "Analyze vendor health, market position, and risk factors",
    icon: Shield,
    color: "blue",
    estimatedTime: "2-3 minutes",
    inputs: ["vendor_name"],
  },
  {
    id: "portfolio_analysis" as AnalysisType,
    name: "Full Portfolio Analysis",
    description: "Comprehensive analysis of entire software portfolio",
    icon: Package,
    color: "orange",
    estimatedTime: "5-10 minutes",
    inputs: [],
  },
  {
    id: "workflow_builder" as AnalysisType,
    name: "Custom Workflow Builder",
    description: "Build custom workflows to replace expensive software modules",
    icon: Workflow,
    color: "indigo",
    estimatedTime: "3-5 minutes",
    inputs: ["software_selection", "modules", "requirements"],
  },
];

export default function AnalysisPage({
  params,
}: {
  params: { companyId: string };
}) {
  const [software, setSoftware] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<AnalysisType | null>(null);
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Input states
  const [selectedSoftware, setSelectedSoftware] = useState<string>("");
  const [vendorName, setVendorName] = useState("");
  const [requirements, setRequirements] = useState("");
  const [modules, setModules] = useState("");

  useEffect(() => {
    fetchSoftware();
  }, [params.companyId]);

  const fetchSoftware = async () => {
    try {
      setLoading(true);
      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (companyResult.success && companyResult.data) {
        const companyId = companyResult.data.id;
        const response = await fetch(`/api/software?companyId=${companyId}`);
        const result = await response.json();

        if (result.success) {
          setSoftware(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching software:", error);
      toast.error("Failed to load software");
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (!selectedType) return;

    setAnalysisRunning(true);
    setResult({ type: selectedType, status: "running" });

    try {
      // Get company ID
      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();
      const companyId = companyResult.data?.id;

      // Prepare request payload
      const payload: any = {
        companyId,
        analysisType: selectedType,
      };

      if (selectedSoftware) {
        payload.softwareId = selectedSoftware;
      }
      if (vendorName) {
        payload.vendorName = vendorName;
      }
      if (requirements) {
        payload.requirements = requirements;
      }
      if (modules) {
        payload.modules = modules.split(",").map(m => m.trim());
      }

      // Call analysis API
      const response = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const analysisResult = await response.json();

      if (analysisResult.success) {
        setResult({
          type: selectedType,
          status: "completed",
          data: analysisResult.data,
          timestamp: new Date(),
        });
        toast.success("Analysis completed successfully!");
      } else {
        throw new Error(analysisResult.error || "Analysis failed");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      setResult({
        type: selectedType,
        status: "failed",
        error: error.message,
        timestamp: new Date(),
      });
      toast.error("Analysis failed");
    } finally {
      setAnalysisRunning(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const selectedAnalysis = ANALYSIS_TYPES.find(a => a.id === selectedType);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-prism-primary to-prism-dark rounded-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Brain className="w-10 h-10" />
          <div>
            <h1 className="text-3xl font-bold">AI Analysis Center</h1>
            <p className="text-blue-100 mt-1">
              Advanced AI-powered insights for your software portfolio
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-prism-secondary" />
            <span className="text-sm">Powered by Claude AI</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-prism-secondary" />
            <span className="text-sm">Real-time Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-prism-secondary" />
            <span className="text-sm">95%+ Accuracy</span>
          </div>
        </div>
      </div>

      {/* Analysis Type Selection */}
      {!selectedType && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ANALYSIS_TYPES.map((analysis) => {
            const Icon = analysis.icon;
            return (
              <Card
                key={analysis.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setSelectedType(analysis.id)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 bg-${analysis.color}-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 text-${analysis.color}-600`} />
                  </div>
                  <CardTitle className="text-xl">{analysis.name}</CardTitle>
                  <CardDescription>{analysis.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Estimated Time:</span>
                      <Badge variant="outline">{analysis.estimatedTime}</Badge>
                    </div>
                    <Button className={`w-full bg-${analysis.color}-600 hover:bg-${analysis.color}-700 group-hover:shadow-md transition-shadow`}>
                      Select Analysis
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Analysis Configuration & Execution */}
      {selectedType && selectedAnalysis && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <selectedAnalysis.icon className={`w-5 h-5 text-${selectedAnalysis.color}-600`} />
                Configuration
              </CardTitle>
              <CardDescription>
                Configure analysis parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedAnalysis.inputs.includes("software_selection") && (
                <div className="space-y-2">
                  <Label>Select Software</Label>
                  <Select value={selectedSoftware} onValueChange={setSelectedSoftware}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose software to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Software</SelectItem>
                      {software.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.software_name} ({s.vendor_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedAnalysis.inputs.includes("vendor_name") && (
                <div className="space-y-2">
                  <Label>Vendor Name</Label>
                  <Input
                    placeholder="Enter vendor name"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                  />
                </div>
              )}

              {selectedAnalysis.inputs.includes("requirements") && (
                <div className="space-y-2">
                  <Label>Requirements (Optional)</Label>
                  <Textarea
                    placeholder="Describe specific requirements or must-have features..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              {selectedAnalysis.inputs.includes("modules") && (
                <div className="space-y-2">
                  <Label>Modules/Features Used</Label>
                  <Textarea
                    placeholder="List the modules or features you actually use (comma-separated)..."
                    value={modules}
                    onChange={(e) => setModules(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">
                    Example: Email, Calendar, File Storage
                  </p>
                </div>
              )}

              <div className="pt-4 space-y-2">
                <Button
                  className="w-full"
                  onClick={runAnalysis}
                  disabled={analysisRunning}
                >
                  {analysisRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running Analysis...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Analysis
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedType(null);
                    setResult(null);
                    setSelectedSoftware("");
                    setVendorName("");
                    setRequirements("");
                    setModules("");
                  }}
                >
                  Back to Selection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                AI-generated insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result && (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No analysis run yet</p>
                  <p className="text-sm text-gray-400">
                    Configure parameters and click &quot;Start Analysis&quot;
                  </p>
                </div>
              )}

              {result?.status === "running" && (
                <div className="text-center py-12">
                  <Loader2 className="w-16 h-16 text-prism-primary mx-auto mb-4 animate-spin" />
                  <p className="text-gray-700 font-semibold mb-2">
                    Running {selectedAnalysis.name}...
                  </p>
                  <p className="text-sm text-gray-500">
                    Estimated time: {selectedAnalysis.estimatedTime}
                  </p>
                  <div className="mt-6 max-w-md mx-auto">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-prism-primary animate-pulse" style={{ width: "60%" }} />
                    </div>
                  </div>
                </div>
              )}

              {result?.status === "failed" && (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-red-700 font-semibold mb-2">Analysis Failed</p>
                  <p className="text-sm text-gray-600">{result.error}</p>
                  <Button
                    className="mt-4"
                    onClick={runAnalysis}
                  >
                    Retry Analysis
                  </Button>
                </div>
              )}

              {result?.status === "completed" && result.data && (
                <div className="space-y-6">
                  {/* Success Header */}
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Analysis Completed</p>
                      <p className="text-sm text-green-700">
                        {new Date(result.timestamp!).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Render results based on analysis type */}
                  {renderResults(result.data, selectedType)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  function renderResults(data: any, type: AnalysisType) {
    switch (type) {
      case "cost_optimization":
        return <CostOptimizationResults data={data} />;
      case "alternative_discovery":
        return <AlternativeDiscoveryResults data={data} />;
      case "vendor_intelligence":
        return <VendorIntelligenceResults data={data} />;
      case "portfolio_analysis":
        return <PortfolioAnalysisResults data={data} />;
      case "workflow_builder":
        return <WorkflowBuilderResults data={data} />;
      default:
        return <GenericResults data={data} />;
    }
  }
}

// Result Components
function CostOptimizationResults({ data }: { data: any }) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Total Savings</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(data.totalSavings || 0)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Licenses to Remove</p>
                <p className="text-2xl font-bold text-blue-900">
                  {data.licensesToRemove || 0}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Recommendations</p>
                <p className="text-2xl font-bold text-purple-900">
                  {data.recommendations?.length || 0}
                </p>
              </div>
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recommendations?.map((rec: any, index: number) => (
              <div key={index} className="border-l-4 border-prism-primary pl-4 py-2">
                <p className="font-semibold text-gray-900">{rec.title}</p>
                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className="bg-green-600">
                    Save {formatCurrency(rec.savings || 0)}
                  </Badge>
                  <span className="text-xs text-gray-500">Impact: {rec.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AlternativeDiscoveryResults({ data }: { data: any }) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alternative Software Found</CardTitle>
          <CardDescription>
            {data.alternatives?.length || 0} alternatives identified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.alternatives?.map((alt: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{alt.name}</h3>
                    <p className="text-sm text-gray-600">{alt.vendor}</p>
                  </div>
                  <Badge className="bg-green-600">
                    Save {formatCurrency(alt.savings || 0)}/yr
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 mb-3">{alt.description}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Feature Parity</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(alt.featureParity || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {((alt.featureParity || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Migration Complexity</p>
                    <Badge variant="outline">{alt.migrationComplexity}</Badge>
                  </div>
                </div>
                <div className="mt-3">
                  <Button variant="outline" size="sm" className="w-full">
                    View Detailed Comparison
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VendorIntelligenceResults({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vendor Health Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-prism-primary mb-2">
                {data.healthScore || "N/A"}/100
              </div>
              <p className="text-gray-600">Overall Health Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.insights?.map((insight: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PortfolioAnalysisResults({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-prism-primary mb-2">
                {data.portfolioHealth || "A"}
              </div>
              <p className="text-gray-600">Overall Grade</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Opportunity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-green-600 mb-2">
                ${((data.totalOpportunity || 0) / 1000).toFixed(0)}K
              </div>
              <p className="text-gray-600">Annual Savings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{data.summary || "Analysis complete."}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function WorkflowBuilderResults({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <Card className="bg-indigo-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-600" />
            Custom Workflow Solution
          </CardTitle>
          <CardDescription>
            Replace expensive software with tailored automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Recommended Stack</h3>
              <div className="flex flex-wrap gap-2">
                {data.recommendedStack?.map((tech: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-white">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Implementation Plan</h3>
              <ol className="list-decimal list-inside space-y-2">
                {data.implementationSteps?.map((step: string, index: number) => (
                  <li key={index} className="text-sm text-gray-700">{step}</li>
                ))}
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Development Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${((data.devCost || 0) / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Annual Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${((data.annualSavings || 0) / 1000).toFixed(0)}K/yr
                </p>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-900 mb-1">ROI Timeline</p>
              <p className="text-sm text-green-700">
                Payback period: {data.paybackMonths || 6} months
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GenericResults({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
