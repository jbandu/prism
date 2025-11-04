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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
  Clock,
  DollarSign,
  User,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

interface SoftwareRequest {
  id: string;
  software_name: string;
  vendor_name?: string;
  requested_by_name: string;
  requested_by_email?: string;
  category?: string;
  estimated_annual_cost?: number;
  license_count_needed?: number;
  business_justification: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  department?: string;
  status: string;
  redundancy_detected: boolean;
  suggested_alternatives?: any[];
  comment_count: number;
  action_count: number;
  created_at: string;
}

export default function ApprovalsPage({ params }: { params: { companyId: string } }) {
  const [requests, setRequests] = useState<SoftwareRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SoftwareRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'comment' | null>(null);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [params.companyId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (!companyResult.success) {
        throw new Error('Failed to get company');
      }

      const companyId = companyResult.data.id;

      const requestsResponse = await fetch(`/api/bot/requests?companyId=${companyId}&status=pending`);
      const requestsResult = await requestsResponse.json();

      if (requestsResult.success) {
        setRequests(requestsResult.data || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (request: SoftwareRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
  };

  const handleComment = (request: SoftwareRequest) => {
    setSelectedRequest(request);
    setActionType('comment');
  };

  const submitAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      setProcessing(true);

      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();
      const companyId = companyResult.data.id;

      const response = await fetch('/api/bot/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          companyId: companyId,
          action: actionType,
          actorName: 'Current User', // In production, get from session
          actorPlatform: 'web',
          comment: comment || undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Request ${actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'commented on'} successfully`);
        setSelectedRequest(null);
        setActionType(null);
        setComment('');
        fetchRequests();
      } else {
        throw new Error(result.error || 'Failed to process action');
      }
    } catch (error) {
      console.error('Action error:', error);
      toast.error('Failed to process action');
    } finally {
      setProcessing(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    };
    return <Badge className={colors[urgency as keyof typeof colors] || ''}>{urgency.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading approval requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-prism-dark">Approval Queue</h1>
        <p className="text-gray-600 mt-2">
          Review and approve software purchase requests from your team
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-prism-dark">{requests.length}</div>
            <p className="text-sm text-gray-600">Pending Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.urgency === 'critical' || r.urgency === 'high').length}
            </div>
            <p className="text-sm text-gray-600">High Priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {requests.filter(r => r.redundancy_detected).length}
            </div>
            <p className="text-sm text-gray-600">Potential Duplicates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-prism-primary">
              ${requests.reduce((sum, r) => sum + (r.estimated_annual_cost || 0), 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Total Requested</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
            <p className="text-gray-600">
              All software requests have been processed
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{request.software_name}</CardTitle>
                      {getUrgencyBadge(request.urgency)}
                      {request.redundancy_detected && (
                        <Badge className="bg-orange-100 text-orange-700">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Potential Duplicate
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {request.requested_by_name}
                      </span>
                      {request.department && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {request.department}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleComment(request)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Comment ({request.comment_count})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(request, 'reject')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAction(request, 'approve')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {request.vendor_name && (
                    <div>
                      <p className="text-sm text-gray-600">Vendor</p>
                      <p className="font-semibold">{request.vendor_name}</p>
                    </div>
                  )}
                  {request.estimated_annual_cost && (
                    <div>
                      <p className="text-sm text-gray-600">Estimated Annual Cost</p>
                      <p className="font-semibold flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {request.estimated_annual_cost.toLocaleString()}/year
                      </p>
                    </div>
                  )}
                  {request.license_count_needed && (
                    <div>
                      <p className="text-sm text-gray-600">Licenses Needed</p>
                      <p className="font-semibold">{request.license_count_needed}</p>
                    </div>
                  )}
                  {request.category && (
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-semibold">{request.category}</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Business Justification</p>
                  <p className="text-gray-900">{request.business_justification}</p>
                </div>

                {request.redundancy_detected && request.suggested_alternatives && request.suggested_alternatives.length > 0 && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Existing Similar Software
                    </p>
                    <div className="space-y-2">
                      {request.suggested_alternatives.map((alt: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded">
                          <p className="font-semibold">{alt.name}</p>
                          <p className="text-sm text-gray-600">{alt.reason}</p>
                          {alt.cost && <p className="text-sm text-gray-900 mt-1">${alt.cost.toLocaleString()}/year</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={selectedRequest !== null} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Request' : actionType === 'reject' ? 'Reject Request' : 'Add Comment'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.software_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {actionType === 'approve' && (
              <p className="text-sm text-gray-600">
                This software will be added to your portfolio once approved.
              </p>
            )}

            <div>
              <Label>Comment {actionType === 'reject' ? '(Required)' : '(Optional)'}</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={actionType === 'reject' ? 'Reason for rejection...' : 'Add a comment...'}
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSelectedRequest(null)} disabled={processing}>
                Cancel
              </Button>
              <Button
                onClick={submitAction}
                disabled={processing || (actionType === 'reject' && !comment)}
                className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Add Comment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
