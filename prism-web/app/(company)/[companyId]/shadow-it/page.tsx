'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, DollarSign, Users, CheckCircle2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ShadowITDetection {
  id: string;
  software_name: string;
  vendor_name?: string;
  detection_method: string;
  detected_from: string;
  detection_confidence: string;
  estimated_monthly_cost: number;
  estimated_user_count?: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: string[];
  status: string;
  action_taken?: string;
  created_at: string;
}

export default function ShadowITPage({ params }: { params: { companyId: string } }) {
  const [detections, setDetections] = useState<ShadowITDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'detected' | 'investigating' | 'resolved'>('detected');

  useEffect(() => {
    fetchDetections();
  }, [params.companyId, filter]);

  const fetchDetections = async () => {
    try {
      setLoading(true);

      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (!companyResult.success) {
        throw new Error('Failed to get company');
      }

      const companyId = companyResult.data.id;

      const url = filter === 'all'
        ? `/api/bot/shadow-it?companyId=${companyId}`
        : `/api/bot/shadow-it?companyId=${companyId}&status=${filter}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setDetections(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching detections:', error);
      toast.error('Failed to load shadow IT detections');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (detectionId: string, newStatus: string, action?: string) => {
    try {
      const response = await fetch('/api/bot/shadow-it', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detectionId,
          status: newStatus,
          actionTaken: action
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Status updated successfully');
        fetchDetections();
      } else {
        throw new Error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    };
    return <Badge className={colors[riskLevel as keyof typeof colors] || ''}>{riskLevel.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      detected: 'bg-red-100 text-red-700',
      investigating: 'bg-blue-100 text-blue-700',
      approved_retroactive: 'bg-green-100 text-green-700',
      consolidating: 'bg-yellow-100 text-yellow-700',
      removed: 'bg-gray-100 text-gray-700',
      false_positive: 'bg-purple-100 text-purple-700'
    };
    return <Badge className={colors[status] || ''}>{status.replace(/_/g, ' ').toUpperCase()}</Badge>;
  };

  const activeDetections = detections.filter(d => ['detected', 'investigating'].includes(d.status));
  const totalMonthlyCost = activeDetections.reduce((sum, d) => sum + d.estimated_monthly_cost, 0);
  const highRiskCount = activeDetections.filter(d => ['high', 'critical'].includes(d.risk_level)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Scanning for shadow IT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-prism-dark">Shadow IT Detection</h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage unauthorized software usage
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-prism-dark">{activeDetections.length}</p>
                <p className="text-sm text-gray-600">Active Detections</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{highRiskCount}</p>
                <p className="text-sm text-gray-600">High Risk</p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-prism-primary">${totalMonthlyCost.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Monthly Cost</p>
              </div>
              <DollarSign className="w-8 h-8 text-prism-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">${(totalMonthlyCost * 12).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Annual Impact</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'detected' ? 'default' : 'outline'}
          onClick={() => setFilter('detected')}
          size="sm"
        >
          Detected
        </Button>
        <Button
          variant={filter === 'investigating' ? 'default' : 'outline'}
          onClick={() => setFilter('investigating')}
          size="sm"
        >
          Investigating
        </Button>
        <Button
          variant={filter === 'resolved' ? 'default' : 'outline'}
          onClick={() => setFilter('resolved')}
          size="sm"
        >
          Resolved
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All
        </Button>
      </div>

      {/* Detections List */}
      {detections.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shadow IT Detected</h3>
            <p className="text-gray-600">
              All software usage is authorized and tracked
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {detections.map((detection) => (
            <Card key={detection.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{detection.software_name}</CardTitle>
                      {getRiskBadge(detection.risk_level)}
                      {getStatusBadge(detection.status)}
                    </div>
                    <CardDescription>
                      Detected from {detection.detected_from} • {new Date(detection.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {detection.vendor_name && (
                    <div>
                      <p className="text-sm text-gray-600">Vendor</p>
                      <p className="font-semibold">{detection.vendor_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Monthly Cost</p>
                    <p className="font-semibold flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {detection.estimated_monthly_cost.toLocaleString()}
                    </p>
                  </div>
                  {detection.estimated_user_count && (
                    <div>
                      <p className="text-sm text-gray-600">Estimated Users</p>
                      <p className="font-semibold flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {detection.estimated_user_count}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Risk Factors</p>
                  <div className="flex flex-wrap gap-2">
                    {detection.risk_factors.map((factor, idx) => (
                      <Badge key={idx} variant="outline" className="bg-red-50 text-red-700">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Detection Details</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Method: </span>
                      <span className="font-medium">{detection.detection_method.replace(/_/g, ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Confidence: </span>
                      <span className="font-medium capitalize">{detection.detection_confidence}</span>
                    </div>
                  </div>
                </div>

                {detection.action_taken && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">Action Taken</p>
                    <p className="text-gray-900">{detection.action_taken}</p>
                  </div>
                )}

                {detection.status === 'detected' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(detection.id, 'investigating', 'Started investigation')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Investigate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(detection.id, 'approved_retroactive', 'Approved for continued use')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(detection.id, 'removed', 'Software removed from organization')}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(detection.id, 'false_positive', 'Marked as false positive')}
                    >
                      False Positive
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
