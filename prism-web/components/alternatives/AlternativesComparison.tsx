'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  Check,
  X,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  Star,
  Target,
  ShieldAlert,
  Lightbulb,
  Save,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { LogoImage } from '@/components/ui/logo-image';

interface AlternativeMatch {
  alternative_software_name: string;
  alternative_vendor_name: string;
  alternative_category: string;
  feature_match_score: number;
  shared_features: string[];
  unique_features_original: string[];
  unique_features_alternative: string[];
  missing_critical_features: string[];
  pricing_model: string;
  estimated_cost_difference_percentage: number;
  cost_comparison_details: {
    estimated_annual_cost: number;
    pricing_structure: string;
    free_tier_available: boolean;
  };
  migration_difficulty: 'easy' | 'moderate' | 'complex' | 'very_complex';
  migration_time_estimate: string;
  migration_cost_estimate: number;
  data_migration_complexity: string;
  integration_challenges: string[];
  market_position: string;
  user_rating: number;
  total_users: number;
  company_size_fit: string;
  recommendation_confidence: 'high' | 'medium' | 'low';
  ai_summary: string;
  pros: string[];
  cons: string[];
  roi: {
    current_annual_cost: number;
    projected_annual_cost: number;
    migration_cost: number;
    training_cost: number;
    integration_cost: number;
    productivity_loss_cost: number;
    total_hidden_costs: number;
    annual_savings: number;
    three_year_savings: number;
    break_even_months: number;
    roi_percentage: number;
    total_cost_of_ownership_3yr: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    risk_factors: string[];
    mitigation_strategies: string[];
  };
}

interface CurrentSoftware {
  id: string;
  software_name: string;
  vendor_name: string;
  category: string;
  annual_cost: number;
  license_count: number;
  active_users: number;
}

interface AlternativesComparisonProps {
  currentSoftware: CurrentSoftware;
  alternatives: AlternativeMatch[];
  onSaveEvaluation?: (alternativeIndex: number) => void;
}

export function AlternativesComparison({
  currentSoftware,
  alternatives,
  onSaveEvaluation
}: AlternativesComparisonProps) {
  const [expandedAlternative, setExpandedAlternative] = useState<number>(0);
  const [savingEvaluation, setSavingEvaluation] = useState<number | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMatchScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent Match', color: 'bg-green-100 text-green-700 border-green-300' };
    if (score >= 75) return { label: 'Good Match', color: 'bg-blue-100 text-blue-700 border-blue-300' };
    if (score >= 60) return { label: 'Fair Match', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    return { label: 'Poor Match', color: 'bg-red-100 text-red-700 border-red-300' };
  };

  const getMigrationDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-blue-100 text-blue-700';
      case 'complex': return 'bg-orange-100 text-orange-700';
      case 'very_complex': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSaveEvaluation = async (index: number) => {
    setSavingEvaluation(index);
    toast.info('Saving evaluation...');

    try {
      if (onSaveEvaluation) {
        await onSaveEvaluation(index);
      }
      toast.success('Evaluation saved successfully');
    } catch (error) {
      toast.error('Failed to save evaluation');
    } finally {
      setSavingEvaluation(null);
    }
  };

  if (alternatives.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alternatives Found</h3>
          <p className="text-gray-600">
            We couldn't find suitable alternatives for this software at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <Card className="border-l-4 border-l-prism-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Software Alternatives Analysis</CardTitle>
          <CardDescription>
            Found {alternatives.length} potential alternatives for {currentSoftware.software_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <LogoImage name={currentSoftware.vendor_name} size={64} className="rounded-lg" />
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{currentSoftware.software_name}</h3>
              <p className="text-sm text-gray-600">{currentSoftware.vendor_name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatCurrency(currentSoftware.annual_cost)}/year • {currentSoftware.license_count} licenses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternatives List */}
      {alternatives.map((alt, index) => {
        const isExpanded = expandedAlternative === index;
        const matchBadge = getMatchScoreBadge(alt.feature_match_score);

        return (
          <Card key={index} className={`${isExpanded ? 'ring-2 ring-prism-primary' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <LogoImage
                    name={alt.alternative_vendor_name}
                    size={56}
                    className="rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{alt.alternative_software_name}</h3>
                        <p className="text-sm text-gray-600">{alt.alternative_vendor_name}</p>
                      </div>
                      <Badge className={`${matchBadge.color} text-sm px-3 py-1`}>
                        {matchBadge.label}
                      </Badge>
                    </div>

                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-green-700 mb-1">
                          <TrendingDown className="w-4 h-4" />
                          <span className="text-xs font-semibold">SAVINGS</span>
                        </div>
                        <p className="text-lg font-bold text-green-700">
                          {formatCurrency(alt.roi.annual_savings)}
                        </p>
                        <p className="text-xs text-gray-600">per year</p>
                      </div>

                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-blue-700 mb-1">
                          <Target className="w-4 h-4" />
                          <span className="text-xs font-semibold">ROI</span>
                        </div>
                        <p className="text-lg font-bold text-blue-700">
                          {alt.roi.roi_percentage.toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-600">3-year</p>
                      </div>

                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-purple-700 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-semibold">BREAK-EVEN</span>
                        </div>
                        <p className="text-lg font-bold text-purple-700">
                          {alt.roi.break_even_months}mo
                        </p>
                        <p className="text-xs text-gray-600">to payback</p>
                      </div>

                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-orange-700 mb-1">
                          <ShieldAlert className="w-4 h-4" />
                          <span className="text-xs font-semibold">RISK</span>
                        </div>
                        <p className="text-lg font-bold text-orange-700 capitalize">
                          {alt.roi.risk_level}
                        </p>
                        <p className="text-xs text-gray-600">level</p>
                      </div>
                    </div>

                    {/* AI Summary */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-5 h-5 text-prism-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{alt.ai_summary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expand/Collapse Button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-4"
                onClick={() => setExpandedAlternative(isExpanded ? -1 : index)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show Detailed Analysis
                  </>
                )}
              </Button>
            </CardHeader>

            {/* Expanded Details */}
            {isExpanded && (
              <CardContent>
                <Tabs defaultValue="features" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="migration">Migration</TabsTrigger>
                    <TabsTrigger value="risks">Risks</TabsTrigger>
                    <TabsTrigger value="market">Market</TabsTrigger>
                  </TabsList>

                  {/* Features Tab */}
                  <TabsContent value="features" className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Feature Match Score</h4>
                        <span className={`text-2xl font-bold ${getMatchScoreColor(alt.feature_match_score)}`}>
                          {alt.feature_match_score}%
                        </span>
                      </div>
                      <Progress value={alt.feature_match_score} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Shared Features ({alt.shared_features.length})
                        </h4>
                        <ul className="space-y-1">
                          {alt.shared_features.slice(0, 5).map((feature, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <Check className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                          {alt.shared_features.length > 5 && (
                            <li className="text-xs text-gray-500 italic">
                              +{alt.shared_features.length - 5} more...
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Unique to Alternative ({alt.unique_features_alternative.length})
                        </h4>
                        <ul className="space-y-1">
                          {alt.unique_features_alternative.slice(0, 5).map((feature, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <ArrowRight className="w-3 h-3 text-blue-600 mt-1 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                          {alt.unique_features_alternative.length > 5 && (
                            <li className="text-xs text-gray-500 italic">
                              +{alt.unique_features_alternative.length - 5} more...
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {alt.missing_critical_features.length > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Missing Critical Features ({alt.missing_critical_features.length})
                        </h4>
                        <ul className="space-y-1">
                          {alt.missing_critical_features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                              <X className="w-3 h-3 mt-1 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Key Advantages</h4>
                        <ul className="space-y-1">
                          {alt.pros.map((pro, idx) => (
                            <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                              <Check className="w-3 h-3 mt-1 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-red-50 rounded-lg">
                        <h4 className="font-semibold text-red-900 mb-2">Considerations</h4>
                        <ul className="space-y-1">
                          {alt.cons.map((con, idx) => (
                            <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                              <AlertTriangle className="w-3 h-3 mt-1 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Pricing Tab */}
                  <TabsContent value="pricing" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Current Annual Cost</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(alt.roi.current_annual_cost)}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Projected Annual Cost</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {formatCurrency(alt.roi.projected_annual_cost)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Annual Savings</p>
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(alt.roi.annual_savings)}
                        </p>
                        <p className="text-xs text-green-600 font-semibold mt-1">
                          {alt.estimated_cost_difference_percentage > 0 ? '+' : ''}
                          {alt.estimated_cost_difference_percentage}% difference
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Pricing Model</h4>
                      <p className="text-gray-700">{alt.pricing_model}</p>
                      <p className="text-sm text-gray-600 mt-1">{alt.cost_comparison_details.pricing_structure}</p>
                      {alt.cost_comparison_details.free_tier_available && (
                        <Badge className="mt-2 bg-blue-100 text-blue-700">Free Tier Available</Badge>
                      )}
                    </div>

                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Hidden Costs Breakdown
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Migration Cost:</span>
                          <span className="font-semibold">{formatCurrency(alt.roi.migration_cost)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Training Cost:</span>
                          <span className="font-semibold">{formatCurrency(alt.roi.training_cost)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Integration Cost:</span>
                          <span className="font-semibold">{formatCurrency(alt.roi.integration_cost)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Productivity Loss:</span>
                          <span className="font-semibold">{formatCurrency(alt.roi.productivity_loss_cost)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Total Hidden Costs:</span>
                          <span className="text-orange-700">{formatCurrency(alt.roi.total_hidden_costs)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">3-Year Total Savings</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {formatCurrency(alt.roi.three_year_savings)}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">3-Year TCO</p>
                        <p className="text-2xl font-bold text-purple-700">
                          {formatCurrency(alt.roi.total_cost_of_ownership_3yr)}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Migration Tab */}
                  <TabsContent value="migration" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Migration Difficulty</h4>
                        <Badge className={`${getMigrationDifficultyColor(alt.migration_difficulty)} text-lg px-4 py-2`}>
                          {alt.migration_difficulty.toUpperCase().replace('_', ' ')}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-3">
                          Estimated Time: <span className="font-semibold">{alt.migration_time_estimate}</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Data Migration: <span className="font-semibold">{alt.data_migration_complexity}</span>
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Break-Even Analysis</h4>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-4xl font-bold text-purple-700">{alt.roi.break_even_months}</p>
                          <p className="text-sm text-gray-600 mt-1">months to break even</p>
                        </div>
                      </div>
                    </div>

                    {alt.integration_challenges.length > 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Integration Challenges
                        </h4>
                        <ul className="space-y-2">
                          {alt.integration_challenges.map((challenge, idx) => (
                            <li key={idx} className="text-sm text-yellow-800 flex items-start gap-2">
                              <span className="text-yellow-600 font-bold">•</span>
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </TabsContent>

                  {/* Risks Tab */}
                  <TabsContent value="risks" className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Overall Risk Level</h4>
                        <Badge className={`${getRiskLevelColor(alt.roi.risk_level)} text-lg px-4 py-2`}>
                          {alt.roi.risk_level.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {alt.roi.risk_factors.length > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4" />
                          Risk Factors ({alt.roi.risk_factors.length})
                        </h4>
                        <ul className="space-y-2">
                          {alt.roi.risk_factors.map((risk, idx) => (
                            <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                              <AlertTriangle className="w-3 h-3 mt-1 flex-shrink-0" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {alt.roi.mitigation_strategies.length > 0 && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Mitigation Strategies
                        </h4>
                        <ul className="space-y-2">
                          {alt.roi.mitigation_strategies.map((strategy, idx) => (
                            <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                              <Check className="w-3 h-3 mt-1 flex-shrink-0" />
                              {strategy}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">AI Recommendation</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${getConfidenceColor(alt.recommendation_confidence)}`}>
                          {alt.recommendation_confidence.toUpperCase()} CONFIDENCE
                        </Badge>
                      </div>
                      <p className="text-gray-700">{alt.ai_summary}</p>
                    </div>
                  </TabsContent>

                  {/* Market Tab */}
                  <TabsContent value="market" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <Star className="w-6 h-6 text-blue-700 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-700">{alt.user_rating.toFixed(1)}</p>
                        <p className="text-sm text-gray-600">User Rating</p>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg text-center">
                        <Users className="w-6 h-6 text-purple-700 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-700">
                          {alt.total_users.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Total Users</p>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <Target className="w-6 h-6 text-green-700 mx-auto mb-2" />
                        <p className="text-lg font-bold text-green-700">{alt.market_position}</p>
                        <p className="text-sm text-gray-600">Market Position</p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Company Size Fit</h4>
                      <p className="text-gray-700">{alt.company_size_fit}</p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={() => handleSaveEvaluation(index)}
                    disabled={savingEvaluation === index}
                  >
                    {savingEvaluation === index ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Evaluation for Review
                      </>
                    )}
                  </Button>
                  <Button size="lg" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
