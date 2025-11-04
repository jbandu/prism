'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  TrendingDown,
  DollarSign,
  Lightbulb,
  AlertTriangle,
  Mail,
  Copy,
  Check,
  BarChart3,
  Users,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface NegotiationPlaybookProps {
  data: {
    software_name: string;
    vendor_name: string;
    current_annual_cost: number;
    target_annual_cost: number;
    potential_savings: number;

    // Market Intelligence
    market_average_price: number;
    market_discount_range_min: number;
    market_discount_range_max: number;
    competitor_alternatives: Array<{
      name: string;
      price_comparison: string;
      features_comparison: string;
    }>;
    pricing_trends: string;

    // Your Leverage
    utilization_rate: number;
    unused_licenses: number;
    contract_length_years: number;
    total_spent_to_date: number;
    payment_history_score: number;

    // Strategy
    recommended_target_discount: number;
    confidence_level: 'high' | 'medium' | 'low';
    leverage_points: string[];
    risks: string[];
    talking_points: string[];

    // Emails
    email_initial_outreach: string;
    email_counter_offer: string;
    email_final_push: string;
    email_alternative_threat: string;
  };
  onRecordOutcome?: () => void;
}

export function NegotiationPlaybook({ data, onRecordOutcome }: NegotiationPlaybookProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success(`${section} copied to clipboard`);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getConfidenceBadge = (level: string) => {
    const colors = {
      high: 'bg-green-100 text-green-700 border-green-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[level as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-prism-primary">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{data.software_name} Negotiation Playbook</CardTitle>
              <CardDescription className="text-base mt-2">
                {data.vendor_name} • Renewal Negotiation Strategy
              </CardDescription>
            </div>
            <Badge className={`text-sm px-4 py-2 ${getConfidenceBadge(data.confidence_level)}`}>
              {data.confidence_level.toUpperCase()} CONFIDENCE
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Current Cost</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.current_annual_cost)}</p>
              <p className="text-xs text-gray-500 mt-1">Annual spend</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Target Cost</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(data.target_annual_cost)}</p>
              <p className="text-xs text-gray-500 mt-1">{data.recommended_target_discount}% discount</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Potential Savings</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(data.potential_savings)}</p>
              <p className="text-xs text-gray-500 mt-1">Per year</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="strategy" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="market">Market Intel</TabsTrigger>
          <TabsTrigger value="leverage">Your Leverage</TabsTrigger>
          <TabsTrigger value="emails">Email Templates</TabsTrigger>
        </TabsList>

        {/* Strategy Tab */}
        <TabsContent value="strategy" className="space-y-4">
          {/* Leverage Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-prism-primary" />
                Your Leverage Points
              </CardTitle>
              <CardDescription>
                Use these data-backed arguments in your negotiation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.leverage_points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 flex-1">{point}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Talking Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Tactical Talking Points
              </CardTitle>
              <CardDescription>
                Phrases to use during negotiation calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.talking_points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-600">💬</span>
                    <p className="text-gray-700 italic">{point}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Risks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Potential Risks & Objections
              </CardTitle>
              <CardDescription>
                Anticipate these vendor responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{risk}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Intelligence Tab */}
        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Market Pricing Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Market Average</p>
                  <p className="text-xl font-bold text-blue-700">{formatCurrency(data.market_average_price)}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Typical Discount Range</p>
                  <p className="text-xl font-bold text-purple-700">
                    {data.market_discount_range_min}% - {data.market_discount_range_max}%
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Pricing Trends</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{data.pricing_trends}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Competitive Alternatives</CardTitle>
              <CardDescription>
                Leverage these alternatives in your negotiation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.competitor_alternatives.map((alt, idx) => (
                  <div key={idx} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{alt.name}</h4>
                      <Badge variant="outline">{alt.price_comparison}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{alt.features_comparison}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Your Leverage Tab */}
        <TabsContent value="leverage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  Utilization Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Current Utilization</span>
                      <span className="text-sm font-semibold">{data.utilization_rate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-orange-500 h-3 rounded-full"
                        style={{ width: `${data.utilization_rate}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-700">{data.unused_licenses}</p>
                    <p className="text-sm text-gray-600">Unused licenses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Relationship History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-700">{data.contract_length_years} years</p>
                    <p className="text-sm text-gray-600">Customer relationship</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(data.total_spent_to_date)}</p>
                    <p className="text-sm text-gray-600">Total lifetime value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="emails" className="space-y-4">
          {[
            { title: 'Initial Outreach', content: data.email_initial_outreach, icon: Mail, color: 'blue' },
            { title: 'Counter Offer', content: data.email_counter_offer, icon: TrendingDown, color: 'yellow' },
            { title: 'Final Push', content: data.email_final_push, icon: Target, color: 'orange' },
            { title: 'Alternative Threat', content: data.email_alternative_threat, icon: AlertTriangle, color: 'red' }
          ].map((template, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <template.icon className={`w-5 h-5 text-${template.color}-600`} />
                    {template.title}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(template.content, template.title)}
                  >
                    {copiedSection === template.title ? (
                      <><Check className="w-4 h-4 mr-2" /> Copied</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-2" /> Copy</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg font-sans">
                  {template.content}
                </pre>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          size="lg"
          className="flex-1"
          onClick={() => copyToClipboard(data.email_initial_outreach, 'Initial Email')}
        >
          <Mail className="w-4 h-4 mr-2" />
          Copy Initial Email & Start Negotiation
        </Button>
        {onRecordOutcome && (
          <Button
            size="lg"
            variant="outline"
            onClick={onRecordOutcome}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Record Outcome
          </Button>
        )}
      </div>
    </div>
  );
}
