'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bot, Save, Slack, MessageSquare, Bell, Shield, DollarSign, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface BotConfig {
  id?: string;
  company_id: string;
  platform: 'slack' | 'teams' | 'both';
  enabled: boolean;
  slack_webhook_url?: string;
  slack_channel_alerts?: string;
  slack_channel_approvals?: string;
  teams_webhook_url?: string;
  teams_channel_alerts?: string;
  teams_channel_approvals?: string;
  notify_renewals: boolean;
  notify_budget_alerts: boolean;
  notify_new_software: boolean;
  notify_contract_risks: boolean;
  notify_waste_detection: boolean;
  notify_redundancy: boolean;
  budget_alert_threshold: number;
  waste_alert_threshold: number;
  renewal_alert_days: number;
}

export default function BotSettingsPage({ params }: { params: { companyId: string } }) {
  const [config, setConfig] = useState<BotConfig>({
    company_id: '',
    platform: 'slack',
    enabled: true,
    notify_renewals: true,
    notify_budget_alerts: true,
    notify_new_software: true,
    notify_contract_risks: true,
    notify_waste_detection: true,
    notify_redundancy: true,
    budget_alert_threshold: 1000,
    waste_alert_threshold: 500,
    renewal_alert_days: 60
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, [params.companyId]);

  const fetchConfig = async () => {
    try {
      setLoading(true);

      // Get company ID
      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (!companyResult.success) {
        throw new Error('Failed to get company');
      }

      const companyId = companyResult.data.id;

      // Get bot configuration
      const configResponse = await fetch(`/api/bot/config?companyId=${companyId}`);
      const configResult = await configResponse.json();

      if (configResult.success && configResult.data) {
        setConfig(configResult.data);
        setIsNew(false);
      } else {
        // No config exists yet
        setConfig(prev => ({ ...prev, company_id: companyId }));
        setIsNew(true);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error('Failed to load bot configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const method = isNew ? 'POST' : 'PATCH';
      const endpoint = '/api/bot/config';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: config.company_id,
          platform: config.platform,
          slackWebhookUrl: config.slack_webhook_url,
          slackChannelAlerts: config.slack_channel_alerts,
          slackChannelApprovals: config.slack_channel_approvals,
          teamsWebhookUrl: config.teams_webhook_url,
          teamsChannelAlerts: config.teams_channel_alerts,
          teamsChannelApprovals: config.teams_channel_approvals,
          notifyRenewals: config.notify_renewals,
          notifyBudgetAlerts: config.notify_budget_alerts,
          notifyNewSoftware: config.notify_new_software,
          notifyContractRisks: config.notify_contract_risks,
          notifyWasteDetection: config.notify_waste_detection,
          notifyRedundancy: config.notify_redundancy,
          budgetAlertThreshold: config.budget_alert_threshold,
          wasteAlertThreshold: config.waste_alert_threshold,
          renewalAlertDays: config.renewal_alert_days
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Bot configuration saved successfully');
        setIsNew(false);
        fetchConfig();
      } else {
        throw new Error(result.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save bot configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Bot className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading bot settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-prism-dark">Bot Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure Slack/Teams integration for automated approvals and alerts
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-prism-primary" />
            Platform Configuration
          </CardTitle>
          <CardDescription>Choose your messaging platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Platform</Label>
            <Select value={config.platform} onValueChange={(value: any) => setConfig({ ...config, platform: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slack">
                  <div className="flex items-center gap-2">
                    <Slack className="w-4 h-4" />
                    Slack
                  </div>
                </SelectItem>
                <SelectItem value="teams">Microsoft Teams</SelectItem>
                <SelectItem value="both">Both Platforms</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Slack Configuration */}
      {(config.platform === 'slack' || config.platform === 'both') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Slack className="w-5 h-5" />
              Slack Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Webhook URL</Label>
              <Input
                value={config.slack_webhook_url || ''}
                onChange={(e) => setConfig({ ...config, slack_webhook_url: e.target.value })}
                placeholder="https://hooks.slack.com/services/..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Get your webhook URL from Slack App settings
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Alerts Channel</Label>
                <Input
                  value={config.slack_channel_alerts || ''}
                  onChange={(e) => setConfig({ ...config, slack_channel_alerts: e.target.value })}
                  placeholder="#alerts"
                />
              </div>
              <div>
                <Label>Approvals Channel</Label>
                <Input
                  value={config.slack_channel_approvals || ''}
                  onChange={(e) => setConfig({ ...config, slack_channel_approvals: e.target.value })}
                  placeholder="#approvals"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams Configuration */}
      {(config.platform === 'teams' || config.platform === 'both') && (
        <Card>
          <CardHeader>
            <CardTitle>Microsoft Teams Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Webhook URL</Label>
              <Input
                value={config.teams_webhook_url || ''}
                onChange={(e) => setConfig({ ...config, teams_webhook_url: e.target.value })}
                placeholder="https://outlook.office.com/webhook/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Alerts Channel</Label>
                <Input
                  value={config.teams_channel_alerts || ''}
                  onChange={(e) => setConfig({ ...config, teams_channel_alerts: e.target.value })}
                  placeholder="Alerts"
                />
              </div>
              <div>
                <Label>Approvals Channel</Label>
                <Input
                  value={config.teams_channel_approvals || ''}
                  onChange={(e) => setConfig({ ...config, teams_channel_approvals: e.target.value })}
                  placeholder="Approvals"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-prism-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose which events trigger notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.notify_renewals}
                onChange={(e) => setConfig({ ...config, notify_renewals: e.target.checked })}
                className="rounded"
              />
              <span>Contract Renewals</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.notify_budget_alerts}
                onChange={(e) => setConfig({ ...config, notify_budget_alerts: e.target.checked })}
                className="rounded"
              />
              <span>Budget Alerts</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.notify_new_software}
                onChange={(e) => setConfig({ ...config, notify_new_software: e.target.checked })}
                className="rounded"
              />
              <span>New Software Requests</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.notify_contract_risks}
                onChange={(e) => setConfig({ ...config, notify_contract_risks: e.target.checked })}
                className="rounded"
              />
              <span>Contract Risks</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.notify_waste_detection}
                onChange={(e) => setConfig({ ...config, notify_waste_detection: e.target.checked })}
                className="rounded"
              />
              <span>Waste Detection</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.notify_redundancy}
                onChange={(e) => setConfig({ ...config, notify_redundancy: e.target.checked })}
                className="rounded"
              />
              <span>Redundancy Alerts</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Alert Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-prism-primary" />
            Alert Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Budget Alert Threshold</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  value={config.budget_alert_threshold}
                  onChange={(e) => setConfig({ ...config, budget_alert_threshold: parseFloat(e.target.value) })}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Waste Alert Threshold</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  value={config.waste_alert_threshold}
                  onChange={(e) => setConfig({ ...config, waste_alert_threshold: parseFloat(e.target.value) })}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Renewal Alert (days before)</Label>
              <Input
                type="number"
                value={config.renewal_alert_days}
                onChange={(e) => setConfig({ ...config, renewal_alert_days: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
