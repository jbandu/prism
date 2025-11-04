'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  Shield,
  TrendingUp,
  Upload as UploadIcon,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { ContractUploader } from '@/components/contracts/ContractUploader';

interface Contract {
  id: string;
  contract_name: string;
  vendor_name: string;
  contract_type: string;
  analysis_status: string;
  renewal_date: string | null;
  cancellation_deadline: string | null;
  contract_value: number | null;
  auto_renewal: boolean;
  active_alerts_count: number;
  critical_alerts_count: number;
  created_at: string;
}

export default function ContractsPage({
  params,
}: {
  params: { companyId: string };
}) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, [params.companyId]);

  const fetchContracts = async () => {
    try {
      setLoading(true);

      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (companyResult.success && companyResult.data) {
        const companyId = companyResult.data.id;

        const contractsResponse = await fetch(`/api/contracts?companyId=${companyId}`);
        const contractsResult = await contractsResponse.json();

        if (contractsResult.success) {
          setContracts(contractsResult.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleViewContract = async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts?contractId=${contractId}`);
      const result = await response.json();

      if (result.success) {
        setSelectedContract(result.data);
        setShowDetails(true);
      }
    } catch (error) {
      toast.error('Failed to load contract details');
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const stats = {
    total: contracts.length,
    autoRenewal: contracts.filter(c => c.auto_renewal).length,
    criticalAlerts: contracts.reduce((sum, c) => sum + (c.critical_alerts_count || 0), 0),
    totalValue: contracts.reduce((sum, c) => sum + (c.contract_value || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-prism-dark">Contract Intelligence</h1>
          <p className="text-gray-600 mt-2">
            AI-powered contract analysis and risk monitoring
          </p>
        </div>
        <Button size="lg" onClick={() => setShowUploader(true)}>
          <UploadIcon className="w-4 h-4 mr-2" />
          Upload Contract
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contracts</p>
                <p className="text-2xl font-bold text-prism-dark">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-prism-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Auto-Renewal</p>
                <p className="text-2xl font-bold text-orange-600">{stats.autoRenewal}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Contracts Yet</h3>
            <p className="text-gray-600 mb-4">
              Upload your first contract to get AI-powered analysis and risk monitoring
            </p>
            <Button onClick={() => setShowUploader(true)}>
              <UploadIcon className="w-4 h-4 mr-2" />
              Upload Contract
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <FileText className="w-10 h-10 text-prism-primary flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {contract.contract_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">{contract.vendor_name}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Type</p>
                            <p className="text-sm font-medium capitalize">{contract.contract_type}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Value</p>
                            <p className="text-sm font-medium">{formatCurrency(contract.contract_value)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Renewal Date</p>
                            <p className="text-sm font-medium">{formatDate(contract.renewal_date)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Auto-Renewal</p>
                            <Badge className={contract.auto_renewal ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}>
                              {contract.auto_renewal ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                        </div>

                        {(contract.active_alerts_count > 0) && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-red-900">
                                {contract.active_alerts_count} Active Alert{contract.active_alerts_count > 1 ? 's' : ''}
                              </p>
                              {contract.critical_alerts_count > 0 && (
                                <p className="text-xs text-red-700">
                                  {contract.critical_alerts_count} Critical
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handleViewContract(contract.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploader} onOpenChange={setShowUploader}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Contract</DialogTitle>
            <DialogDescription>
              Upload a PDF contract for AI-powered analysis
            </DialogDescription>
          </DialogHeader>
          <ContractUploader
            companyId={params.companyId}
            onUploadComplete={(contractId) => {
              setShowUploader(false);
              fetchContracts();
              toast.success('Contract uploaded successfully!');
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Contract Details Dialog */}
      {selectedContract && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedContract.contract.contract_name}</DialogTitle>
              <DialogDescription>{selectedContract.contract.vendor_name}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* AI Summary */}
              {selectedContract.contract.ai_summary && (
                <Card className="bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">AI Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedContract.contract.ai_summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* Risk Alerts */}
              {selectedContract.risk_alerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Risk Alerts ({selectedContract.risk_alerts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedContract.risk_alerts.map((alert: any) => (
                      <div
                        key={alert.id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                        {alert.action_description && (
                          <p className="text-sm text-blue-700 mt-2">
                            ✓ {alert.action_description}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Key Terms */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Terms</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Contract Period</p>
                    <p className="font-medium">
                      {formatDate(selectedContract.contract.contract_start_date)} - {formatDate(selectedContract.contract.contract_end_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Notice Period</p>
                    <p className="font-medium">{selectedContract.contract.notice_period_days || 'N/A'} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contract Value</p>
                    <p className="font-medium">{formatCurrency(selectedContract.contract.contract_value)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Terms</p>
                    <p className="font-medium">{selectedContract.contract.payment_terms || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
