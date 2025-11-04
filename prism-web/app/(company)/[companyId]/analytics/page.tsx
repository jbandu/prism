'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Activity, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { UsageHeatmap } from '@/components/analytics/UsageHeatmap';
import { UsageInsightsDashboard } from '@/components/analytics/UsageInsightsDashboard';

interface Software {
  id: string;
  software_name: string;
  vendor_name: string;
}

export default function AnalyticsPage({
  params,
}: {
  params: { companyId: string };
}) {
  const [software, setSoftware] = useState<Software[]>([]);
  const [selectedSoftware, setSelectedSoftware] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSoftware();
  }, [params.companyId]);

  useEffect(() => {
    if (selectedSoftware) {
      fetchAnalytics();
    }
  }, [selectedSoftware]);

  const fetchSoftware = async () => {
    try {
      setLoading(true);

      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (companyResult.success && companyResult.data) {
        const companyId = companyResult.data.id;

        const softwareResponse = await fetch(`/api/software?companyId=${companyId}`);
        const softwareResult = await softwareResponse.json();

        if (softwareResult.success) {
          const softwareList = softwareResult.data || [];
          setSoftware(softwareList);

          // Auto-select first software
          if (softwareList.length > 0) {
            setSelectedSoftware(softwareList[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching software:', error);
      toast.error('Failed to load software');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedSoftware) return;

    try {
      // Get company ID
      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (!companyResult.success) return;

      const companyId = companyResult.data.id;

      // Fetch heatmap data
      const heatmapResponse = await fetch(
        `/api/usage/heatmap?companyId=${companyId}&softwareId=${selectedSoftware}`
      );
      const heatmapResult = await heatmapResponse.json();

      if (heatmapResult.success) {
        setHeatmapData(heatmapResult.data);
      }

      // Fetch insights
      const insightsResponse = await fetch(
        `/api/usage/insights?companyId=${companyId}&softwareId=${selectedSoftware}`
      );
      const insightsResult = await insightsResponse.json();

      if (insightsResult.success) {
        setInsights(insightsResult.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleGenerateData = async () => {
    if (!selectedSoftware) {
      toast.error('Please select a software');
      return;
    }

    setGenerating(true);

    toast.info('🤖 Generating sample usage data...', {
      description: 'This will take a few seconds'
    });

    try {
      // Get company ID
      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (!companyResult.success) {
        throw new Error('Failed to get company ID');
      }

      const companyId = companyResult.data.id;

      const response = await fetch('/api/dev/generate-usage-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          softwareId: selectedSoftware,
          days: 90
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('✨ Sample data generated!', {
          description: `Created ${result.data.logs_created} days of usage data`
        });

        // Refresh analytics
        await fetchAnalytics();
      } else {
        throw new Error(result.error || 'Failed to generate data');
      }
    } catch (error) {
      console.error('Generate data error:', error);
      toast.error('Failed to generate sample data');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (software.length === 0) {
    return (
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-prism-dark">Usage Analytics</h1>
          <p className="text-gray-600 mt-2">
            No software found. Add software to your portfolio first.
          </p>
        </div>
      </div>
    );
  }

  const selectedSoftwareData = software.find(s => s.id === selectedSoftware);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-prism-dark">Usage Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track activity patterns, detect waste, and optimize license usage
          </p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Software Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-600 mb-2 block">Select Software</label>
              <Select value={selectedSoftware} onValueChange={setSelectedSoftware}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {software.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.software_name} ({s.vendor_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateData} disabled={generating}>
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Sample Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Content */}
      {heatmapData && heatmapData.heatmap.length > 0 ? (
        <>
          {/* Heatmap */}
          <UsageHeatmap
            data={heatmapData.heatmap}
            title={`${selectedSoftwareData?.software_name} - Activity Heatmap`}
            description={`Last ${heatmapData.stats.total_days} days of usage activity`}
          />

          {/* Insights Dashboard */}
          {insights && insights.insights.length > 0 && (
            <UsageInsightsDashboard
              insights={insights.insights}
              summary={insights.summary}
            />
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Usage Data</h3>
            <p className="text-gray-600 mb-4">
              Click &ldquo;Generate Sample Data&rdquo; to create 90 days of sample usage data for testing
            </p>
            <Button onClick={handleGenerateData} disabled={generating}>
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Sample Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
